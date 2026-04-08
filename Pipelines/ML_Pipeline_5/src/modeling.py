import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def _prep(X: pd.DataFrame):
    num_cols = X.select_dtypes(include=[np.number, bool]).columns.tolist()
    cat_cols = [c for c in X.columns if c not in num_cols]
    return ColumnTransformer(
        [
            ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
            ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat_cols),
        ]
    )


def train_predictive_top_area(X: pd.DataFrame, y_top: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(X, y_top, test_size=0.25, random_state=random_state, stratify=y_top)
    prep = _prep(X_train)
    models = {
        "logistic_top_area": LogisticRegression(max_iter=1000, random_state=random_state),
        "rf_top_area": RandomForestClassifier(n_estimators=300, random_state=random_state, n_jobs=-1),
    }
    rows = []
    fitted = {}
    for name, model in models.items():
        pipe = Pipeline([("prep", prep), ("model", model)])
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test)
        rows.append({"model": name, "accuracy": accuracy_score(y_test, pred), "macro_f1": f1_score(y_test, pred, average="macro")})
        fitted[name] = pipe
    res = pd.DataFrame(rows).sort_values("macro_f1", ascending=False).reset_index(drop=True)
    best = res.loc[0, "model"]
    return res, fitted[best]


def train_explanatory_share(X: pd.DataFrame, y_share: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(X, y_share, test_size=0.25, random_state=random_state)
    prep = _prep(X_train)
    baseline = Pipeline([("prep", prep), ("model", LinearRegression())])
    stronger = Pipeline([("prep", prep), ("model", RandomForestRegressor(n_estimators=250, random_state=random_state, n_jobs=-1))])
    baseline.fit(X_train, y_train)
    stronger.fit(X_train, y_train)
    pred_b = baseline.predict(X_test)
    pred_s = stronger.predict(X_test)
    metrics = pd.DataFrame(
        [
            {"model": "linear_share_education", "r2": r2_score(y_test, pred_b), "mae": mean_absolute_error(y_test, pred_b)},
            {"model": "rf_share_education", "r2": r2_score(y_test, pred_s), "mae": mean_absolute_error(y_test, pred_s)},
        ]
    ).sort_values("r2", ascending=False).reset_index(drop=True)

    coef_model = baseline.named_steps["model"]
    feat_names = baseline.named_steps["prep"].get_feature_names_out()
    coef_df = pd.DataFrame({"feature": feat_names, "coefficient": coef_model.coef_}).sort_values("coefficient", ascending=False)
    return metrics, baseline, stronger, coef_df


def donor_impact_output(df: pd.DataFrame, best_top_model, share_model) -> pd.DataFrame:
    X = df[
        [
            "donation_id",
            "supporter_id",
            "donation_value",
            "is_recurring",
            "channel_source",
            "donation_type",
            "campaign_name",
            "supporter_type",
            "relationship_type",
            "region",
            "acquisition_channel",
        ]
    ].copy()
    out = df[["donation_id", "supporter_id", "donation_value"]].copy()
    out["pred_top_program_area"] = best_top_model.predict(X)
    out["pred_share_education"] = share_model.predict(X)
    out["pred_share_education"] = out["pred_share_education"].clip(0, 1)
    out["pred_share_education_low"] = (out["pred_share_education"] - 0.10).clip(0, 1)
    out["pred_share_education_high"] = (out["pred_share_education"] + 0.10).clip(0, 1)
    return out.sort_values("pred_share_education", ascending=False).reset_index(drop=True)
