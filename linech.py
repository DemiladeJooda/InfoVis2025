import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st

# Function to remove outliers using IQR
def remove_outliers(df, columns, threshold=1.5):
    cleaned_df = df.copy()
    for col in columns:
        if cleaned_df[col].dtype in ['float64', 'int64']:  # Ensure it's a numerical column
            Q1 = cleaned_df[col].quantile(0.25)
            Q3 = cleaned_df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            cleaned_df = cleaned_df[(cleaned_df[col] >= lower_bound) & (cleaned_df[col] <= upper_bound)]
    return cleaned_df

# Load dataset
data = pd.read_csv('Surface_Water_Quality_Monitoring_Data.csv', parse_dates=['SampleDate'])
data.sort_values('SampleDate', inplace=True)
data.dropna(subset=['SampleDate'], inplace=True)
data.set_index('SampleDate', inplace=True)
data.index = data.index.tz_localize(None)  # Remove timezone info

# Identify numerical columns for outlier removal
numerical_columns = ['Temperature', 'DissolvedOxygen', 'Ph', 'Conductivity', 
                     'BiologicalOxygenDemand', 'TotalSuspendedSolids', 'EColi']

# Remove outliers
cleaned_data = remove_outliers(data, numerical_columns)

st.title("Water Quality Analysis (Outliers Removed)")

# Interactive date selection (ONLY ONCE)
st.header("Select Date Range for Analysis")
start_date, end_date = st.date_input("Choose date range:",
                                     [cleaned_data.index.min(), cleaned_data.index.max()],
                                     min_value=cleaned_data.index.min(),
                                     max_value=cleaned_data.index.max())

# Ensure valid date selection
if start_date > end_date:
    st.error("Error: Start date must be before end date.")
else:
    filtered_data = cleaned_data.loc[start_date:end_date]

    # Scatter Plot Analysis
    st.header("Scatter Plot Analysis")
    scatter_parameters = {
        "Temperature vs. Dissolved Oxygen": ("Temperature", "DissolvedOxygen"),
        "pH vs. Conductivity": ("Ph", "Conductivity")
    }
    selected_scatter = st.selectbox("Select scatter plot:", list(scatter_parameters.keys()))
    x_param, y_param = scatter_parameters[selected_scatter]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.scatter(filtered_data[x_param], filtered_data[y_param], alpha=0.7)
    ax.set_xlabel(x_param)
    ax.set_ylabel(y_param)
    ax.set_title(f"Scatter Plot of {x_param} vs. {y_param} (Outliers Removed)")
    ax.grid(True)
    st.pyplot(fig)

    # Time Series Analysis
    st.header("Water Quality Time Series Analysis")
    parameters = {
        "pH": "Ph",
        "Temperature": "Temperature",
        "DO": "DissolvedOxygen",
        "BOD": "BiologicalOxygenDemand",
        "TSS": "TotalSuspendedSolids",
        "E. coli": "EColi"
    }

    selected_params = st.multiselect('Select parameters to visualize:', parameters.keys(), default=["pH"])

    fig, ax = plt.subplots(figsize=(12, 6))
    for param in selected_params:
        ax.plot(filtered_data.index, filtered_data[parameters[param]], label=param)

    ax.set_xlabel("Date")
    ax.set_ylabel("Parameter Values")
    ax.set_title(f"Time Series Analysis ({start_date} to {end_date})")
    ax.grid(True)
    ax.legend()
    st.pyplot(fig)

    # Comparative Analysis (Bar Chart)
    st.header("Comparative Analysis - Average Water Quality by Location")
    location_means = data.groupby('Location')[['Ph', 'Temperature', 'DissolvedOxygen', 'EColi']].mean()
    selected_param = st.selectbox("Select parameter for comparison:", location_means.columns)

    fig, ax = plt.subplots(figsize=(12, 6))
    location_means[selected_param].plot(kind='bar', ax=ax, color='royalblue')
    ax.set_xlabel("Location")
    ax.set_ylabel(selected_param)
    ax.set_title(f"Average {selected_param} Across Locations")
    ax.grid(axis='y')
    st.pyplot(fig)

  
    # Comparative Analysis (Bar Chart)
    st.header("Comparative Analysis - Average Water Quality by Location")
    location_means = data.groupby('Location')[['Ph', 'Temperature', 'DissolvedOxygen', 'EColi']].mean()
    selected_param = st.selectbox("Select parameter for comparison:", location_means.columns)

    fig, ax = plt.subplots(figsize=(12, 6))
    location_means[selected_param].plot(kind='bar', ax=ax, color='royalblue')
    ax.set_xlabel("Location")
    ax.set_ylabel(selected_param)
    ax.set_title(f"Average {selected_param} Across Locations")
    ax.grid(axis='y')
    st.pyplot(fig)

    # Anomaly Detection with Toggle Button
    st.header("Anomaly Detection - Highlighting Unsafe Levels")
    thresholds = {
        "Ph": (6.5, 8.5),
        "Temperature": (0, 30),
        "DissolvedOxygen": (5, 10),
        "EColi": (0, 100)
    }
    
    selected_anomaly_param = st.selectbox("Select parameter for anomaly detection:", thresholds.keys())
    lower, upper = thresholds[selected_anomaly_param]
    chart_type = st.radio("Select chart type:", ["Line Chart", "Bar Chart"], index=0)
    
    fig, ax = plt.subplots(figsize=(12, 6))
    if chart_type == "Line Chart":
        ax.plot(filtered_data.index, filtered_data[selected_anomaly_param], label=selected_anomaly_param)
    else:
        ax.bar(filtered_data.index, filtered_data[selected_anomaly_param], label=selected_anomaly_param, color='blue')
    
    ax.axhline(y=lower, color='red', linestyle='--', label=f"Lower Threshold ({lower})")
    ax.axhline(y=upper, color='red', linestyle='--', label=f"Upper Threshold ({upper})")
    
    ax.set_xlabel("Date")
    ax.set_ylabel(selected_anomaly_param)
    ax.set_title(f"Anomaly Detection for {selected_anomaly_param}")
    ax.legend()
    ax.grid(True)
    st.pyplot(fig)


 # Static Visualizations
    st.header("Important Parameters (Static Visualizations)")
    important_params = ['DissolvedOxygen', 'Ph', 'EColi']

    for param in important_params:
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.plot(filtered_data.index, filtered_data[param], label=param)
        ax.set_title(f"Trend of {param} (Outliers Removed)")
        ax.set_xlabel("Date")
        ax.set_ylabel(param)
        ax.grid(True)
        st.pyplot(fig)
