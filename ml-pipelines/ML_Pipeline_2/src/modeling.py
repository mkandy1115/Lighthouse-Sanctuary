import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_absolute_error, r2_score, roc_auc_score, average_precision_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def _prep(X: pd.DataFrame):
    num_cols = X.select_dtypes(include=[np.number, bool]).columns.tolist()
    cat_cols = [c for c in X.columns if c not in num_cols]
    return ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
            ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat_cols),
        ]
    )


def train_engagement_models(X: pd.DataFrame, y: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=random_state)
    prep = _prep(X_train)
    models = {
        "linear_regression": LinearRegression(),
        "random_forest_regressor": RandomForestRegressor(n_estimators=250, random_state=random_state, n_jobs=-1),
    }
    rows = []
    fitted = {}
    for name, model in models.items():
        pipe = Pipeline([("prep", prep), ("model", model)])
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test)
        rows.append({"model": name, "r2": r2_score(y_test, pred), "mae": mean_absolute_error(y_test, pred)})
        fitted[name] = pipe
    results = pd.DataFrame(rows).sort_values("r2", ascending=False).reset_index(drop=True)
    best = results.loc[0, "model"]
    return results, fitted[best]


def train_referral_models(X: pd.DataFrame, y_binary: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(X, y_binary, test_size=0.25, random_state=random_state, stratify=y_binary)
    prep = _prep(X_train)
    model = LogisticRegression(max_iter=1000, random_state=random_state)
    pipe = Pipeline([("prep", prep), ("model", model)])
    pipe.fit(X_train, y_train)
    proba = pipe.predict_proba(X_test)[:, 1]
    metrics = {
        "roc_auc": roc_auc_score(y_test, proba),
        "pr_auc": average_precision_score(y_test, proba),
    }
    feat_names = pipe.named_steps["prep"].get_feature_names_out()
    coef = pipe.named_steps["model"].coef_[0]
    coef_df = pd.DataFrame({"feature": feat_names, "coefficient": coef, "odds_ratio": np.exp(coef)}).sort_values("coefficient", ascending=False)
    return metrics, pipe, coef_df
