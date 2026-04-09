import time

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, f1_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def _build_preprocessor(X: pd.DataFrame):
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [c for c in X.columns if c not in numeric_cols]

    numeric_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, numeric_cols),
            ("cat", categorical_pipe, categorical_cols),
        ]
    )
    return preprocessor


def train_and_evaluate(X: pd.DataFrame, y: pd.Series, random_state: int = 42, cv_folds: int = 3):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=random_state, stratify=y
    )

    preprocessor = _build_preprocessor(X_train)
    models = {
        "logistic": LogisticRegression(max_iter=1000, random_state=random_state),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1,
        ),
    }

    results = []
    fitted = {}
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)

    for model_name, model in models.items():
        start = time.time()
        pipe = Pipeline(steps=[("prep", preprocessor), ("model", model)])
        cv_proba = cross_val_predict(
            pipe,
            X_train,
            y_train,
            cv=cv,
            method="predict_proba",
            n_jobs=-1,
        )[:, 1]
        cv_pred = (cv_proba >= 0.5).astype(int)
        pipe.fit(X_train, y_train)
        test_proba = pipe.predict_proba(X_test)[:, 1]
        test_pred = (test_proba >= 0.5).astype(int)

        results.append(
            {
                "model": model_name,
                "cv_roc_auc": roc_auc_score(y_train, cv_proba),
                "cv_pr_auc": average_precision_score(y_train, cv_proba),
                "cv_f1": f1_score(y_train, cv_pred),
                "test_roc_auc": roc_auc_score(y_test, test_proba),
                "test_pr_auc": average_precision_score(y_test, test_proba),
                "test_f1": f1_score(y_test, test_pred),
                "elapsed_seconds": round(time.time() - start, 2),
            }
        )
        fitted[model_name] = pipe

    results_df = pd.DataFrame(results).sort_values("test_roc_auc", ascending=False).reset_index(drop=True)
    best_model_name = results_df.loc[0, "model"]
    return {
        "results_df": results_df,
        "best_model_name": best_model_name,
        "best_model": fitted[best_model_name],
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
    }


def score_donors(model, X: pd.DataFrame, supporter_id_col: str = "supporter_id") -> pd.DataFrame:
    out = X[[supporter_id_col]].copy() if supporter_id_col in X.columns else pd.DataFrame(index=X.index)
    out["churn_probability_365"] = model.predict_proba(X)[:, 1]
    out["risk_tier"] = pd.cut(
        out["churn_probability_365"],
        bins=[-0.01, 0.35, 0.65, 1.0],
        labels=["Low", "Medium", "High"],
    )
    return out.sort_values("churn_probability_365", ascending=False).reset_index(drop=True)


def train_explanatory_model(X: pd.DataFrame, y: pd.Series, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=random_state, stratify=y
    )
    preprocessor = _build_preprocessor(X_train)
    model = LogisticRegression(max_iter=1000, random_state=random_state)
    pipe = Pipeline(steps=[("prep", preprocessor), ("model", model)])
    pipe.fit(X_train, y_train)

    test_proba = pipe.predict_proba(X_test)[:, 1]
    test_pred = (test_proba >= 0.5).astype(int)
    metrics = {
        "test_roc_auc": roc_auc_score(y_test, test_proba),
        "test_pr_auc": average_precision_score(y_test, test_proba),
        "test_f1": f1_score(y_test, test_pred),
    }

    feat_names = pipe.named_steps["prep"].get_feature_names_out()
    coefs = pipe.named_steps["model"].coef_[0]
    coef_df = pd.DataFrame(
        {
            "feature": feat_names,
            "coefficient": coefs,
            "odds_ratio": np.exp(coefs),
        }
    ).sort_values("coefficient", ascending=False)

    return {
        "model": pipe,
        "metrics": metrics,
        "coef_df": coef_df,
        "top_positive": coef_df.head(10).reset_index(drop=True),
        "top_negative": coef_df.tail(10).sort_values("coefficient").reset_index(drop=True),
    }
