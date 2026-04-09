import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def _prep(X: pd.DataFrame):
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = [c for c in X.columns if c not in num_cols]
    return ColumnTransformer(
        [
            ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
            ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat_cols),
        ]
    )


def train_predictive_and_explanatory(X: pd.DataFrame, y: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=random_state, stratify=y)
    prep = _prep(X_train)

    rf = Pipeline([("prep", prep), ("model", RandomForestClassifier(n_estimators=250, random_state=random_state, n_jobs=-1))])
    rf.fit(X_train, y_train)
    rf_proba = rf.predict_proba(X_test)[:, 1]
    rf_metrics = {"roc_auc": roc_auc_score(y_test, rf_proba), "pr_auc": average_precision_score(y_test, rf_proba)}

    logit = Pipeline([("prep", prep), ("model", LogisticRegression(max_iter=1000, random_state=random_state))])
    logit.fit(X_train, y_train)
    lg_proba = logit.predict_proba(X_test)[:, 1]
    lg_metrics = {"roc_auc": roc_auc_score(y_test, lg_proba), "pr_auc": average_precision_score(y_test, lg_proba)}

    feat_names = logit.named_steps["prep"].get_feature_names_out()
    coef = logit.named_steps["model"].coef_[0]
    coef_df = pd.DataFrame({"feature": feat_names, "coefficient": coef, "odds_ratio": np.exp(coef)}).sort_values("coefficient", ascending=False)

    return rf, rf_metrics, logit, lg_metrics, coef_df
