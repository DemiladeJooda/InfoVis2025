import pandas as pd
import matplotlib.pyplot as plt
from ipywidgets import interact, widgets

# Load data
data = pd.read_csv('Surface_Water_Quality_Monitoring_Data.csv', parse_dates=['SampleDate'])
data['SampleDate'] = pd.to_datetime(data['SampleDate'])

# Clean and prepare data
data.sort_values(by='SampleDate', inplace=True)
data['SampleDate'] = pd.to_datetime(data['SampleDate'])

# Parameters for visualization
params = {
    "pH": "Ph",
    "Temperature": "Weather",
    "DO": "DissolvedOxygen",
    "BOD": "BiologicalOxygenDemand",
    "TSS": "TotalSuspendedSolids",
    "E. coli": "EColi"
}

# Line chart with checkboxes for parameters
def plot_time_series(parameter):
    plt.figure(figsize=(12, 6))
    plt.plot(data['SampleDate'], data[params[parameter]], label=parameter)
    plt.title(f"Time Series Analysis for {parameter}")
    plt.xlabel("Time")
    plt.ylabel(parameter)
    plt.grid(True)
    plt.show()

# Widget for parameter selection
interact(plot_time_series, parameter=widgets.Dropdown(options=params.keys(), description='Select Parameter'))
