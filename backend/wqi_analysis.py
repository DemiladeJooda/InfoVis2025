# file: wqi_analysis.py

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
import plotly.express as px


def compute_wqi_feature_importance(df: pd.DataFrame):
    params = [
        'Ph', 'Temperature', 'DissolvedOxygen', 'Conductivity',
        'BiologicalOxygenDemand', 'TotalSuspendedSolids',
        'EColi', 'Ammonia', 'Nitrate'
    ]

    df_clean = df.dropna(subset=params + ['SampleDate']).copy()
    df_clean['SampleDate'] = pd.to_datetime(df_clean['SampleDate'], errors='coerce')
    df_clean.dropna(subset=['SampleDate'], inplace=True)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(df_clean[params])
    df_norm = pd.DataFrame(X_scaled, columns=params)
    df_norm['WQI'] = df_norm.mean(axis=1)

    df_clean.reset_index(drop=True, inplace=True)
    df_clean['WQI'] = df_norm['WQI']

    # 🚀 Faster Static Importance
    model = RandomForestRegressor(n_estimators=50, n_jobs=-1, random_state=42)
    model.fit(df_norm[params], df_norm['WQI'])

    importance_df = pd.DataFrame({
        'Parameter': params,
        'Importance': model.feature_importances_
    }).sort_values(by='Importance', ascending=False)

    fig_static = px.bar(
        importance_df,
        x='Importance',
        y='Parameter',
        orientation='h',
        title='Static Parameter Impact on WQI',
        labels={'Importance': 'Relative Importance'},
        template='plotly_white',
        height=500
    )

    # 📈 Optimized Time Series Importance
    df_clean['Quarter'] = df_clean['SampleDate'].dt.to_period('Q').astype(str)
    trends = []
    shared_model = RandomForestRegressor(n_estimators=25, n_jobs=-1, random_state=42)

    for quarter, group in df_clean.groupby('Quarter'):
        if len(group) < 20:
            continue
        try:
            shared_model.fit(group[params], group['WQI'])
            importance = shared_model.feature_importances_
            trends.extend({
                'Quarter': quarter,
                'Parameter': param,
                'Importance': importance[i]
            } for i, param in enumerate(params))
        except Exception:
            continue

    df_trend = pd.DataFrame(trends)
    fig_trend = px.line(
        df_trend,
        x='Quarter',
        y='Importance',
        color='Parameter',
        title='Parameter Importance Over Time (Quarterly)',
        template='plotly_white',
        markers=True
    )

    return fig_static, fig_trend