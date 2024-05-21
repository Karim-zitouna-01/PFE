
import pandas as pd

import matplotlib.pyplot as plt
import io


def get_descriptive_stats(df):
  """
  Calculates descriptive statistics for each column of a DataFrame.

  Args:
      df (pd.DataFrame): The DataFrame to analyze.

  Returns:
      dict: A dictionary containing descriptive statistics for each column.
  """
  stats = {}
  for col in df.columns:
      stats[col] = {
          "mean": round(df[col].mean(), 2) if df[col].dtype != 'object' else None,
          "median": round(df[col].median(), 2) if df[col].dtype != 'object' else None,
          "max": df[col].max() if df[col].dtype != 'object' else None,
          "min": df[col].min() if df[col].dtype != 'object' else None,
          "mode": df[col].mode().iloc[0],  # No rounding for mode
          "n_missing": df[col].isnull().sum()
      }
  print(stats)
  return stats

def get_column_stats(df, column_name):
  """
  Calculates descriptive statistics for a specific column in a DataFrame.

  Args:
      df (pd.DataFrame): The DataFrame to analyze.
      column_name (str): The name of the column to analyze.

  Returns:
      dict: A dictionary containing descriptive statistics for the specified column.
  """
  if column_name not in df.columns:
    raise ValueError(f"Column '{column_name}' not found in the DataFrame.")
  stats = {
    "mean": round(df[column_name].mean(), 2) if df[column_name].dtype != 'object' else None,
    "median": round(df[column_name].median(), 2) if df[column_name].dtype != 'object' else None,
    "max": df[column_name].max() if df[column_name].dtype != 'object' else None,
    "min": df[column_name].min() if df[column_name].dtype != 'object' else None,
    "mode": df[column_name].mode().iloc[0] if df[column_name].dtype != 'object' else None,
    "n_missing": df[column_name].isnull().sum()
  }
  return {column_name:stats}





def plot_distribution_numeric(df, column_name):
  """
  Generates a box plot for the distribution of a numeric feature.

  Args:
      df (pd.DataFrame): The DataFrame containing the data.
      column_name (str): The name of the numeric column to visualize.

  Returns:
      bytes: The image data of the generated box plot.
  """
  plt.figure(figsize=(8, 6))
  df[column_name].plot(kind='box')
  plt.title(f"Distribution of {column_name}")
  plt.xlabel(column_name)
  plt.ylabel('Values')
  plt.grid(True)
  # Convert the plot to a byte array
  buf = io.BytesIO()
  plt.savefig(buf, format='jpeg')
  
  return buf.getvalue()

def plot_distribution_categorical(df, column_name, chart_type='bar'):
  """
  Generates a bar chart or pie chart for the distribution of a categorical feature.

  Args:
      df (pd.DataFrame): The DataFrame containing the data.
      column_name (str): The name of the categorical column to visualize.
      chart_type (str, optional): Type of chart (bar or pie). Defaults to 'bar'.

  Returns:
      bytes: The image data of the generated chart.
  """
  if chart_type not in ['bar', 'pie']:
    raise ValueError(f"Invalid chart type: {chart_type}")
  plt.figure(figsize=(8, 6))
  if chart_type == 'bar':
    df[column_name].value_counts().plot(kind='bar')
  else:
    df[column_name].value_counts().plot(kind='pie', autopct='%1.1f%%')
  plt.title(f"Distribution of {column_name}")
  plt.xlabel(column_name)
  plt.ylabel('Count')
  # Convert the plot to a byte array (similar to numeric plot)
  buf = io.BytesIO()
  plt.savefig(buf, format='png')
  buf.seek(0)
  return buf.getvalue()

def plot_relationship(df, feature1, feature2):
  """
  Generates a scatter plot for the relationship between two features.

  Args:
      df (pd.DataFrame): The DataFrame containing the data.
      feature1 (str): The name of the first feature.
      feature2 (str): The name of the second feature.

  Returns:
      bytes: The image data of the generated scatter plot.
  """
  plt.figure(figsize=(8, 6))
  plt.scatter(df[feature1], df[feature2])
  plt.title(f"Relationship between {feature1} and {feature2}")
  plt.xlabel(feature1)
  plt.ylabel(feature2)
  # Convert the plot to a byte array (similar to numeric plot)
  buf = io.BytesIO()
  plt.savefig(buf, format='png')
  buf.seek(0)
  return buf.getvalue()
