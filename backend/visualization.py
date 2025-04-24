import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import seaborn as sns
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import base64
from io import BytesIO
import plotly.io as pio
pio.templates.default = "plotly_white"
px.set_mapbox_access_token("pk.eyJ1IjoiZGVtaWoiLCJhIjoiY205dGc5aTl5MGFsMTJpb2Zsd3d2d3hpaCJ9.Od1r9cRXwkXxwhXyvh8yqA")


def process_uploaded_csv(file_content):
    """Process the uploaded CSV file and return a pandas DataFrame"""
    df = pd.read_csv(BytesIO(file_content))
    # Clean column names (remove spaces, special characters)
    df.columns = df.columns.str.strip()
    # Convert SampleDate to datetime if it exists
    if 'SampleDate' in df.columns:
        df['SampleDate'] = pd.to_datetime(df['SampleDate'], errors='coerce')
    return df

# Main visualization function that will be called based on user selection
# Main visualization function that will be called based on user selection
def generate_visualization(df, vis_type, parameter=None, location_filter=None):
    """
    Generate visualizations based on user selection
    
    Parameters:
    - df: pandas DataFrame with water quality data
    - vis_type: type of visualization to generate
    - parameter: water quality parameter to visualize
    - location_filter: filter for specific locations
    
    Returns:
    - fig: plotly figure object for interactive visualizations
    """

    global location_name_map  # share with other functions

    # Map LocationID to Location Name
    location_name_map = {}
    if 'LocationID' in df.columns and 'Location' in df.columns:
        location_name_map = df.dropna(subset=['LocationID', 'Location']) \
                              .drop_duplicates(subset='LocationID') \
                              .set_index('LocationID')['Location'].to_dict()

    # Filter by location if specified
    if location_filter and 'LocationID' in df.columns:
        df = df[df['LocationID'].isin(location_filter)]

    # Route to specific visualization type
    match vis_type:
        case "time_series":
            return time_series_visualization(df, parameter)
        case "parameter_comparison":
            return parameter_comparison(df, parameter)
        case "location_comparison":
            return location_comparison(df, parameter)
        case "map_view":
            return map_visualization(df, parameter)
        case "correlation_matrix":
            return correlation_matrix(df)
        case "box_plots":
            return box_plots(df, parameter)
        case "threshold_analysis":
            return threshold_analysis(df, parameter)
        case "seasonal_analysis":
            return seasonal_analysis(df, parameter)
        case "scatter_plot":
            return scatterplot_comparison(df, parameter[0], parameter[1])
        case _:
            return None



# Modified Time Series Visualization
def time_series_visualization(df, parameter):
    """Generate time series visualization for a specific parameter"""
    if 'SampleDate' not in df.columns or parameter not in df.columns:
        return None
    
    # Make a copy of the dataframe to avoid SettingWithCopyWarning
    plot_df = df.copy()
    
    # Ensure data is properly sorted by date and location
    plot_df = plot_df.sort_values(['LocationID', 'SampleDate'])
    
    # Identify gaps in time series that are larger than expected
    # This helps prevent incorrect line connections
    plot_df['date_diff'] = plot_df.groupby('LocationID')['SampleDate'].diff().dt.days
    
    # Create a group identifier that changes when there's a large gap
    # This will create separate traces for disconnected segments
    gap_threshold = 60  # Gap threshold in days (adjust as needed)
    plot_df['segment'] = (plot_df['date_diff'] > gap_threshold).cumsum()
    plot_df['group'] = plot_df['LocationID'].astype(str) + '_' + plot_df['segment'].astype(str)
    
    # Create a plotly figure with improved settings
    fig = px.line(
        plot_df, 
        x='SampleDate', 
        y=parameter, 
        color=df['LocationID'].map(location_name_map).fillna(df['LocationID']),
        title=f'{parameter} Over Time by Location',
        labels={parameter: parameter, 'SampleDate': ''},
        line_shape='linear',  # Use linear connections between points
        render_mode='svg'  # Use SVG for crisper lines
    )
    
    # Explicitly do not connect gaps
    fig.update_traces(
        connectgaps=False,
        line=dict(width=2)  # Thicker lines for better visibility
    )
    
    fig.update_layout(
        height=500,
    legend=dict(
        orientation="h",           # horizontal legend
        yanchor="bottom",
        y=-0.3,                    # push below the chart
        xanchor="center",
        x=0.5,                     # center it
        font=dict(size=12),
        itemsizing='trace',
        title_text='Location',
    ),
  margin=dict(t=60, b=120, l=40, r=40)      # more bottom space
)
    
    # Improve date formatting on x-axis
    fig.update_xaxes(
        tickformat="%Y-%m-%d",
        tickangle=45,
        tickmode='auto',
        nticks=10,
        gridcolor='lightgray',  # Lighter grid for better contrast
        linewidth=1,  # Thicker axis lines
        linecolor='black'  # Black axis lines for clarity
    )
    
    # Ensure y-axis starts from zero if appropriate for the parameter
    fig.update_yaxes(
        rangemode='tozero',
        gridcolor='lightgray',  # Lighter grid for better contrast
        linewidth=1,  # Thicker axis lines
        linecolor='black'  # Black axis lines for clarity
    )
    
    return fig



#scatter plot 
def scatterplot_comparison(df, x_param, y_param):
    """Create a scatter plot comparing two water quality parameters"""
    if x_param not in df.columns or y_param not in df.columns or 'LocationID' not in df.columns:
        return None

    fig = go.Figure()

    for location in df['LocationID'].unique():
        loc_data = df[df['LocationID'] == location]
        fig.add_trace(go.Scatter(
            x=loc_data[x_param],
            y=loc_data[y_param],
            mode='markers',
            name=location_name_map.get(location, location),
            marker=dict(size=8, opacity=0.7),
            hovertemplate=(
    "<b>%{fullData.name}</b><br>" +
    x_param + ": %{x}<br>" +
    y_param + ": %{y}<extra></extra>"
)



        ))

    fig.update_layout(
        #title=f'{y_param} vs {x_param} by Location',
        xaxis_title=x_param,
        yaxis_title=y_param,
        template='plotly_white',
        autosize=False,
        width=1000,
        height=600,
        margin=dict(l=60, r=60, t=80, b=80),
        font=dict(family="Arial, sans-serif", size=14),
        plot_bgcolor='white',
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    fig.update_xaxes(gridcolor='lightgray', linewidth=1, linecolor='black')
    fig.update_yaxes(gridcolor='lightgray', linewidth=1, linecolor='black', rangemode='tozero')

    return fig


# Parameter Comparison - Optimized
def parameter_comparison(df, parameters):
    """Compare multiple parameters across locations"""
    if not isinstance(parameters, list):
        parameters = [parameters]
    
    # Filter for only the selected parameters
    params_df = df[['LocationID', 'SampleDate'] + parameters]
    
    # Create subplots - one for each parameter
    fig = make_subplots(rows=len(parameters), cols=1, 
                        shared_xaxes=True,
                        subplot_titles=parameters,
                        vertical_spacing=0.1)  # Increased spacing for clarity
    
    colors = px.colors.qualitative.Bold  # Using a bolder color scheme
    location_ids = df['LocationID'].unique()
    
    for i, param in enumerate(parameters):
        for j, location in enumerate(location_ids):
            loc_data = params_df[params_df['LocationID'] == location]
            # Sort data by date to ensure proper line connections
            loc_data = loc_data.sort_values('SampleDate')
            
            fig.add_trace(
                go.Scatter(
                    x=loc_data['SampleDate'],
                    y=loc_data[param],
                    mode='lines+markers',
                    name=f'{location} - {param}',
                    legendgroup=location,
                    marker=dict(color=colors[j % len(colors)], size=8),  # Larger markers
                    line=dict(width=2, shape='linear'),  # Thicker, linear lines
                    showlegend=(i == 0)  # Only show in legend for first parameter
                ),
                row=i+1, col=1
            )
    
    fig.update_layout(
        height=200 * len(parameters),  # Reduced from 300
        width=600,  # Reduced from 1000
        title_text="Parameter Comparison Across Locations",
        legend_title="Location ID",
        template='plotly_white',
        autosize=False,  # Disable autosize for consistent rendering
        margin=dict(l=40, r=40, t=60, b=40),  # Reduced margins
        font=dict(
            family="Arial, sans-serif",
            size=14  # Larger font for better readability
        ),
        plot_bgcolor='white'  # Ensure white background for clarity
    )
    
    # Update all xaxes
    fig.update_xaxes(
        tickformat="%Y-%m-%d",
        tickangle=45,
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black'
    )
    
    # Update all yaxes
    fig.update_yaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black'
    )
    
    return fig


def location_comparison(df, parameter):
    """Compare a parameter across different locations"""
    if parameter not in df.columns or 'LocationID' not in df.columns:
        return None

    # Group by location and calculate stats
    location_stats = df.groupby('LocationID')[parameter].agg(['mean', 'std', 'min', 'max']).reset_index()

    # Add human-readable location name
    location_stats['LocationName'] = location_stats['LocationID'].map(location_name_map).fillna(location_stats['LocationID'])

    # Create the comparison bar chart
    fig = px.bar(
        location_stats,
        x='LocationID',
        y='mean',
        error_y='std',
        color='LocationName',
        labels={'mean': f'Mean {parameter}', 'LocationID': 'Location ID'},
        title=f'{parameter} Comparison by Location',
        color_discrete_sequence=px.colors.qualitative.Bold
    )

#Add min/max markers
    for i, row in location_stats.iterrows():
        fig.add_trace(go.Scatter(
            x=[row['LocationID'], row['LocationID']],
            y=[row['min'], row['max']],
            mode='markers',
            marker=dict(symbol=['triangle-down', 'triangle-up'], size=12, line=dict(width=1, color='black')),
            name=f"{row['LocationID']} Min/Max",
            showlegend=False
        ))

    fig.update_layout(
        #xaxis_title='Location ID',
        yaxis_title=f'{parameter} Value',
        template='plotly_white',
        autosize=False,
        width=600,
        height=400,
        margin=dict(l=40, r=40, t=60, b=40),
        font=dict(family="Arial, sans-serif", size=14),
        plot_bgcolor='white',
        bargap=0.3
    )

    fig.update_xaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        type='category'
    )

    fig.update_yaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        rangemode='tozero'
    )

    return fig
# Map Visualization - with Debugging Print Statements
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def map_visualization(df, parameter=None):
    """Create a map visualization of the parameter across different locations"""
    logger.debug("Starting map visualization")

    # Check required columns
    print("Columns in dataframe:", df.columns.tolist())
    if 'Latitude' not in df.columns or 'Longitude' not in df.columns:
        print("Missing Latitude or Longitude column!")
        return None

    print("Parameter requested:", parameter)
    if not parameter or parameter not in df.columns:
        map_data = df[['LocationID', 'Latitude', 'Longitude']].dropna().drop_duplicates()
    else:
        map_data = df.dropna(subset=['Latitude', 'Longitude', parameter])
        map_data = map_data.groupby(['LocationID', 'Latitude', 'Longitude'])[parameter].mean().reset_index()

    print("Preview of map_data:")
    print(map_data.head())
    print("Map data shape:", map_data.shape)

    # Check value ranges
    print("Latitude range:", map_data['Latitude'].min(), map_data['Latitude'].max())
    print("Longitude range:", map_data['Longitude'].min(), map_data['Longitude'].max())
    if parameter in map_data.columns:
        print(f"{parameter} range:", map_data[parameter].min(), map_data[parameter].max())

    # Add readable location name
    try:
        map_data['LocationName'] = map_data['LocationID'].map(location_name_map).fillna(map_data['LocationID'])
    except Exception as e:
        logger.exception("Location name mapping failed")
        map_data['LocationName'] = map_data['LocationID']

    # Fallback marker size
    marker_size = 15 if parameter is None or parameter not in df.columns else None
    fallback_size = [10] * len(map_data) if marker_size is None else None

    try:
        fig = px.scatter_mapbox(
            map_data,
            lat='Latitude',
            lon='Longitude',
            hover_name='LocationName',
            color=parameter if parameter and parameter in df.columns else None,
            size=parameter if parameter and parameter in df.columns else fallback_size,
            zoom=4,
            center=dict(lat=map_data['Latitude'].mean(), lon=map_data['Longitude'].mean()),
            mapbox_style='carto-positron',
            title=f"{parameter} Map" if parameter else "Sampling Locations Map"
        )

        fig.update_layout(
            height=500,
            width=600,
            autosize=False,
            margin=dict(l=40, r=40, t=50, b=0),
            font=dict(family="Arial, sans-serif", size=14)
        )

        print("Map figure generated successfully.")
        return fig

    except Exception as e:
        print("Map rendering failed:", e)
        logger.exception("Failed to create scatter_mapbox plot")
        return None





# Correlation Matrix - Optimized
def correlation_matrix(df):
    """Generate a correlation matrix for water quality parameters"""
    # Select only numeric columns for correlation
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Remove ID columns and other non-parameter columns
    exclude_cols = ['OBJECTID', 'GlobalID', 'Latitude', 'Longitude']
    parameter_cols = [col for col in numeric_cols if col not in exclude_cols]
    
    # Calculate correlation matrix
    corr_matrix = df[parameter_cols].corr()
    
    # Create heatmap
    fig = px.imshow(corr_matrix,
                   labels=dict(x="Parameter", y="Parameter", color="Correlation"),
                   x=corr_matrix.columns,
                   y=corr_matrix.columns,
                   color_continuous_scale='RdBu_r',  # Red-Blue scale for correlations
                   zmin=-1,  # Fixed scale for correlations
                   zmax=1,
                   title='Correlation Matrix of Water Quality Parameters')
    # Pull the axes labels closer to axes
    fig.update_xaxes(
        title_standoff=5,  # Reduce distance between axis and title
        tickangle=-45,     # Rotate labels for better readability
        showline=True,     # Show axis line
        linecolor='black', # Color of axis line
        ticks="outside",   # Place ticks outside
        ticklen=5          # Length of tick marks
    )

    fig.update_yaxes(
        title_standoff=5,  # Reduce distance between axis and title
        showline=True,     # Show axis line
        linecolor='black', # Color of axis line
        ticks="outside",   # Place ticks outside
        ticklen=5          # Length of tick marks
    )
    
    fig.update_layout(
        width=600,  # Reduced from 900
        height=600, # Reduced from 800
        autosize=False,
        coloraxis_colorbar=dict(
            title="Correlation",
            thicknessmode="pixels", thickness=20,
            lenmode="pixels", len=300,
            yanchor="top", y=1,
            ticks="outside",
            tickvals=[-1, -0.5, 0, 0.5, 1],  # Explicit tick values
            ticktext=["-1.0", "-0.5", "0.0", "0.5", "1.0"]  # Formatted text
        ),
        margin=dict(l=80, r=150, t=100, b=80),  # Adjusted margins
        font=dict(
            family="Arial, sans-serif",
            size=14
        )
    )
    
    # Add correlation values as text
    for i, row in enumerate(corr_matrix.values):
        for j, val in enumerate(row):
            fig.add_annotation(
                x=j, y=i,
                text=f"{val:.2f}",
                showarrow=False,
                font=dict(
                    color='white' if abs(val) > 0.5 else 'black',
                    size=12  # Smaller text for readability
                )
            )
    
    return fig


# Box Plots - Optimized
def box_plots(df, parameter):
    """Generate box plots for a parameter across different locations"""
    if parameter not in df.columns or 'LocationID' not in df.columns:
        return None
    
    fig = px.box(df, x='LocationID', y=parameter, 
                color=df['LocationID'].map(location_name_map).fillna(df['LocationID']),

                title=f'Distribution of {parameter} by Location',
                points='outliers',  # Only show outlier points for cleaner look
                color_discrete_sequence=px.colors.qualitative.Bold)
    
    fig.update_traces(
        boxmean=True,  # Show mean as a dashed line
        jitter=0.3,  # Add jitter to points
        pointpos=0,  # Position points at center
        boxpoints='outliers',  # Only show outliers
        marker=dict(size=8, opacity=0.7),  # Adjust marker appearance
        line=dict(width=2),  # Thicker box lines
        fillcolor='rgba(255,255,255,0.6)'  # Semi-transparent fill
    )
    
    fig.update_layout(
        #xaxis_title='Location ID',
        yaxis_title=parameter,
        template='plotly_white',
        autosize=False,
        width=600,  # Reduced from 1000
        height=400, # Reduced from 600
        margin=dict(l=40, r=40, t=60, b=40),  # Reduced margins
        font=dict(
            family="Arial, sans-serif",
            size=14
        ),
        plot_bgcolor='white'
    )
    
    # Update axes
    fig.update_xaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        type='category'  # Ensure categorical x-axis
    )
    
    fig.update_yaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        zeroline=True,
        zerolinewidth=1.5,
        zerolinecolor='black'
    )
    
    return fig

def threshold_analysis(df, parameter):
    """
    Analyze parameter data against regulatory thresholds
    Note: Thresholds are examples and should be adjusted based on actual regulations
    """
    if parameter not in df.columns:
        return None
    
    thresholds = {
        'Ph': {'min': 6.5, 'max': 8.5, 'name': 'pH'},
        'Temperature': {'max': 32, 'name': 'Temperature (°C)'},
        'DissolvedOxygen': {'min': 5.0, 'name': 'Dissolved Oxygen (mg/L)'},
        'Conductivity': {'max': 1500, 'name': 'Conductivity (μS/cm)'},
        'BiologicalOxygenDemand': {'max': 5.0, 'name': 'BOD (mg/L)'},
        'TotalSuspendedSolids': {'max': 50.0, 'name': 'TSS (mg/L)'},
        'EColi': {'max': 126, 'name': 'E. coli (CFU/100mL)'},
        'Ammonia': {'max': 1.0, 'name': 'Ammonia (mg/L)'},
        'Nitrate': {'max': 10.0, 'name': 'Nitrate (mg/L)'}
    }

    if parameter not in thresholds:
        # Create a basic histogram if no threshold is defined
        fig = px.histogram(df, x=parameter, 
                          color='LocationID',  # Use LocationID directly instead of mapping
                          title=f'Distribution of {parameter}',
                          color_discrete_sequence=px.colors.qualitative.Bold,
                          opacity=0.8,
                          nbins=30)  # Control number of bins for cleaner look
        
        fig.update_layout(
            bargap=0.1,  # Gap between bars
            width=700,
            height=500
        )
        return fig
    
    # Create a figure with a histogram and threshold lines
    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=False,
        row_heights=[0.75, 0.25],
        vertical_spacing=0.12,
        specs=[[{}], [{"type": "table"}]]
    )
    
    # Get unique locations (limit to reasonable number to avoid performance issues)
    locations = df['LocationID'].unique()
    if len(locations) > 10:  # Limit to 10 locations if there are too many
        locations = locations[:10]
    
    # Add histograms for each location
    colors = px.colors.qualitative.Bold  # Get color palette
    for i, location in enumerate(locations):
        loc_data = df[df['LocationID'] == location]
        color_idx = i % len(colors)  # Ensure we don't run out of colors
        
        fig.add_trace(
            go.Histogram(
                x=loc_data[parameter],
                name=location_name_map.get(location, str(location)),
                opacity=0.7,
                marker_color=colors[color_idx],
                xbins=dict(size=(df[parameter].max() - df[parameter].min()) / 30),
                autobinx=False
            ),
            row=1,
            col=1
        )

    # Update layout before calculating y_max
    fig.update_layout(
        #xaxis_title=thresholds[parameter]['name'],
        yaxis_title='Count',
        template='plotly_white',
        barmode='overlay',
        bargap=0.1,
        width=700,
        height=600,
        margin=dict(l=60, r=60, t=80, b=80),
        font=dict(family="Arial, sans-serif", size=14),
        plot_bgcolor='white',
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    # First pass to get the maximum y value
    # This is a simplified approach - in real-world code, you might calculate this differently
    y_max = 20  # Default estimate
    
    # Draw vertical threshold lines
    if 'min' in thresholds[parameter]:
        min_val = thresholds[parameter]['min']
        fig.add_shape(
            type="line", x0=min_val, x1=min_val, y0=0, y1=y_max,
            xref="x1", yref="y1",
            line=dict(dash="dash", color="red", width=3)
        )
        fig.add_annotation(
            x=min_val, y=y_max * 0.95,  # Position slightly below top
            text="Min Threshold",
            showarrow=False,
            yanchor="bottom",
            font=dict(size=12, color="red"),
            xref="x1", yref="y1"
        )

    if 'max' in thresholds[parameter]:
        max_val = thresholds[parameter]['max']
        fig.add_shape(
            type="line", x0=max_val, x1=max_val, y0=0, y1=y_max,
            xref="x1", yref="y1",
            line=dict(dash="dash", color="black", width=3)
        )
        fig.add_annotation(
            x=max_val, y=y_max * 0.95,  # Position slightly below top
            text="Max Threshold",
            showarrow=False,
            yanchor="bottom",
            font=dict(size=12, color="red"),
            xref="x1", yref="y1"
        )
    # Calculate exceedance percentages
    exceedance_data = []
    for loc in locations:  # Use the same limited location set
        loc_data = df[df['LocationID'] == loc]
        result = {'LocationID': loc}
        if 'min' in thresholds.get(parameter, {}):
            below_min = (loc_data[parameter] < thresholds[parameter]['min']).mean() * 100
            result['Below_Min (%)'] = round(below_min, 1)
        if 'max' in thresholds.get(parameter, {}):
            above_max = (loc_data[parameter] > thresholds[parameter]['max']).mean() * 100
            result['Above_Max (%)'] = round(above_max, 1)
        exceedance_data.append(result)
    
    # Create a DataFrame for exceedance percentages
    exceedance_df = pd.DataFrame(exceedance_data)
    
    # Add a table with exceedance percentages
    if not exceedance_df.empty:
        cols = list(exceedance_df.columns)
        
        # Add table below histogram
        fig.add_trace(
            go.Table(
                header=dict(
                    values=cols,
                    fill_color='paleturquoise',
                    align='left',
                    font=dict(size=14, color='black'),
                    line=dict(color='black', width=1)
                ),
                cells=dict(
                    values=[exceedance_df[col].tolist() for col in cols],  # Convert to list to ensure same length
                    fill_color='lavender',
                    align='left',
                    font=dict(size=13),
                    line=dict(color='white', width=1),
                    height=30
                )
            ),
            row=2,
            col=1
        )
    
    # Update axes
    fig.update_xaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black'
    )
    
    fig.update_yaxes(
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        rangemode='tozero'
    )
    
    return fig

# Seasonal Analysis - Optimized
def seasonal_analysis(df, parameter):
    """Analyze how a parameter changes seasonally"""
    if 'SampleDate' not in df.columns or parameter not in df.columns:
        return None
    
    # Add month and season columns
    df = df.copy()
    df['Month'] = df['SampleDate'].dt.month
    df['Season'] = pd.cut(
        df['Month'],
        bins=[0, 3, 6, 9, 12],
        labels=['Winter', 'Spring', 'Summer', 'Fall'],
        include_lowest=True
    )
    
    # Create seasonal subplot figure
    fig = make_subplots(
        rows=1, cols=2, 
        # subplot_titles=(
        #     f'Seasonal Patterns of {parameter}', 
        #     f'Monthly Patterns of {parameter}'
        # ),
        horizontal_spacing=0.1
    )
    
    # Season subplot
    seasons = ['Winter', 'Spring', 'Summer', 'Fall']
    for i, location in enumerate(df['LocationID'].unique()):
        loc_data = df[df['LocationID'] == location]
        season_data = loc_data.groupby('Season')[parameter].mean()
        # Ensure all seasons are included, even if missing
        season_data = season_data.reindex(seasons)
        
        fig.add_trace(
            go.Scatter(
                x=season_data.index,
                y=season_data.values,
                mode='lines+markers',
                name=location_name_map.get(location, location),
                line=dict(width=3),  # Thicker line
                marker=dict(
                    size=10,  # Larger markers
                    line=dict(width=1, color='black')  # Add marker outline
                )
            ), 
            row=1, col=1
        )
    
    # Monthly subplot
    monthly_data = df.groupby(['Month', 'LocationID'])[parameter].mean().reset_index()
    
    fig.add_trace(
        go.Box(
            x=monthly_data['Month'],
            y=monthly_data[parameter],
            name='Monthly Distribution',
            marker=dict(
                color='rgba(0,128,128,0.7)',  # Teal colored boxes
                line=dict(width=1, color='black')
            ),
            line=dict(width=1.5, color='black')
        ),
        row=1, col=2
    )
    
    # Add individual points for each location
    for i, location in enumerate(df['LocationID'].unique()):
        loc_data = monthly_data[monthly_data['LocationID'] == location]
        fig.add_trace(
            go.Scatter(
                x=loc_data['Month'],
                y=loc_data[parameter],
                mode='markers',
                name=location_name_map.get(location, location),
                marker=dict(
                    size=8,
                    line=dict(width=1, color='black'),
                    color=px.colors.qualitative.Bold[i % len(px.colors.qualitative.Bold)]
                )
            ),
            row=1, col=2
        )
    
    # Improve layout
    fig.update_layout(
        height=400,  # Reduced from 600
        width=800,   # Reduced from 1200
        template='plotly_white',
        autosize=False,
        margin=dict(l=40, r=40, t=60, b=40),  # Reduced margins
        font=dict(
            family="Arial, sans-serif",
            size=14
        ),
        plot_bgcolor='white',
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        )
    )
    
    # Update seasonal x-axis
    fig.update_xaxes(
        title="Season",
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        type='category',
        row=1, col=1
    )
    
    # Set x-axis for monthly plot to show month names
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    fig.update_xaxes(
        title="Month",
        tickvals=list(range(1, 13)),
        ticktext=month_names,
        gridcolor='lightgray',
        linewidth=1,
        linecolor='black',
        row=1, col=2
    )
    
    # Update both y-axes
    for i in range(1, 3):
        fig.update_yaxes(
            title=parameter,
            gridcolor='lightgray',
            linewidth=1,
            linecolor='black',
            zeroline=True,
            zerolinewidth=1,
            zerolinecolor='black',
            row=1, col=i
        )
    
    return fig

def summary_statistics_visualization(df, parameter):
    """
    Generate only distribution plots for selected parameters
    Adjusts to match the Dashboard.js expected format
    """
    # Handle the case when parameter is a string (just one parameter)
    if isinstance(parameter, str):
        parameters = [parameter]
    # Handle the case when parameter is None or empty
    elif not parameter:
        # Choose numeric columns that are likely water quality parameters
        exclude_cols = ['OBJECTID', 'GlobalID', 'Latitude', 'Longitude']
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        parameters = [col for col in numeric_cols if col not in exclude_cols][:5]  # Limit to first 5
    # Otherwise, assume parameter is already a list
    else:
        parameters = parameter

    # Make sure we have at least one parameter
    if not parameters:
        return None

    # Distribution plots for each parameter
    dist_plots = []
    for param in parameters:
        fig = px.histogram(
            df,
            x=param,
            nbins=40,
            title=f'Distribution of {param}',
            marginal="box",
            color_discrete_sequence=['#1f77b4']
        )
        fig.update_layout(
            template='plotly_white',
            height=500,
            width=800,
            margin=dict(l=60, r=60, t=80, b=60),
            font=dict(
                family="Arial, sans-serif",
                size=14
            ),
            #xaxis_title=param,
            yaxis_title="Count",
            plot_bgcolor='white'
        )
        
        # Enhanced axes
        fig.update_xaxes(
            gridcolor='lightgray',
            linewidth=1,
            linecolor='black'
        )
        
        fig.update_yaxes(
            gridcolor='lightgray',
            linewidth=1,
            linecolor='black',
            rangemode='tozero'  # Start from zero
        )
        
        # Convert figure to JSON directly
        dist_plots.append(fig.to_json())

    # Return the distributions directly
    return {
        'distributions': dist_plots
    }
    

# Example function to convert plotly figures to base64 for embedding in React
def fig_to_base64(fig):
    """Convert a plotly figure to base64 encoded image with high DPI"""
    img_bytes = fig.to_image(format="png", scale=2)  # Scale=2 doubles the DPI for crisper images
    encoded = base64.b64encode(img_bytes).decode('ascii')
    return f"data:image/png;base64,{encoded}"


# This function would be exposed to the React frontend
def get_visualization(data, vis_type, parameter=None, location_filter=None, date_range=None):
    """
    Main function to be called from React frontend

    Parameters:
    - data: CSV data as string or bytes
    - vis_type: type of visualization to generate
    - parameter: parameter to visualize
    - location_filter: optional filter for locations
    - date_range: dictionary with 'start' and 'end' keys for filtering dates

    Returns:
    - JSON with visualization data that can be rendered in React
    """
    df = process_uploaded_csv(data)

    if date_range and 'SampleDate' in df.columns:
        df['SampleDate'] = pd.to_datetime(df['SampleDate'], errors='coerce').dt.tz_localize(None)
        start = pd.to_datetime(date_range.get('start'), errors='coerce').tz_localize(None)
        end = pd.to_datetime(date_range.get('end'), errors='coerce').tz_localize(None)
        df = df[(df['SampleDate'] >= start) & (df['SampleDate'] <= end)]

    if vis_type == 'summary_statistics':
        result = summary_statistics_visualization(df, parameter)
        if result:
            return {
                'success': True,
                'distributions': result['distributions']
            }
        else:
            return {
                'success': False,
                'error': 'Could not generate distribution plots'
            }
    else:
        fig = generate_visualization(df, vis_type, parameter, location_filter)
        if fig:
            return {
                'success': True,
                'plotlyData': fig.to_json(),
                'config': {
                    'responsive': True,
                    'displayModeBar': True,
                    'toImageButtonOptions': {
                        'format': 'png',
                        'filename': f'{vis_type}_{parameter}',
                        'scale': 2
                    }
                }
            }
        else:
            return {
                'success': False,
                'error': 'Could not generate visualization'
            }
