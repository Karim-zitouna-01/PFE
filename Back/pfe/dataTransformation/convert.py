import pandas as pd
from imblearn.over_sampling import SMOTE, ADASYN, RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler, NearMiss, ClusterCentroids

from sklearn.preprocessing import LabelEncoder
from collections import Counter, defaultdict
import re

def convert_column(dataset_path, column_name, target_type):
  """
  Converts a column in a CSV dataset to a specific data type.

  Args:
      dataset_path (str): Path to the CSV dataset file.
      column_name (str): Name of the column to convert.
      target_type (str): Target data type (e.g., "int", "float").

  Returns:
      pandas.DataFrame: The modified DataFrame with the converted column.
  """
  df = pd.read_csv(dataset_path)
  try:
    # Extract the numeric part of each value in the column using a regular expression
    df[column_name] = df[column_name].apply(lambda x: re.sub(r'[^\d\.]+', '', str(x)))

    #when using this, the missing values will be replaced with zeroes
    #df[column_name] = df[column_name].fillna(0).apply(lambda x: re.sub(r'[^\d\.]+', '', str(x)))

    # Convert column to target data type and handle potential conversion errors
    df[column_name] = pd.to_numeric(df[column_name], errors='coerce').astype(target_type)
  except ValueError:
    # Handle potential conversion errors (e.g., invalid data format)
    raise ValueError(f"Error converting column '{column_name}' to type '{target_type}'")
  return df





def discretize_column(dataset_path, column_name, bins, names=None, strategy='cut'):
  """
  Discretizes a column in a CSV dataset using either equal-width ('cut') or equal-frequency ('qcut') strategy.

  Args:
      dataset_path (str): Path to the CSV dataset file.
      column_name (str): Name of the column to discretize.
      bins (int): Number of bins for discretization.
      names (list, optional): Custom names for the bins. Defaults to None.
      strategy (str, optional): Discretization strategy ('cut' or 'qcut'). Defaults to 'cut'.

  Returns:
      pandas.DataFrame: The modified DataFrame with the discretized column.
  """
  df = pd.read_csv(dataset_path)

  if strategy == 'cut':
    labels = pd.cut(df[column_name], bins, labels=names)
  elif strategy == 'qcut':
    labels = pd.qcut(df[column_name], bins, labels=names)
  else:
    raise ValueError(f"Unsupported discretization strategy: {strategy}")

  df[column_name] = labels
  return df



def sample_data(dataset_path, target_column, sampling_method, minority_class=None, **kwargs):
  """
  Samples a dataset using over-sampling or under-sampling techniques.

  Args:
      dataset_path (str): Path to the CSV dataset file.
      target_column (str): Name of the target column.
      sampling_method (str): Sampling method (e.g., 'SMOTE', 'ADASYN', 'RandomOverSampler', 'RandomUnderSampler', 'NearMiss', 'ClusterCentroids').
      minority_class (optional): Class label for the minority class (used for over-sampling). Defaults to None.
      **kwargs (optional): Additional keyword arguments for specific sampling methods.

  Returns:
      pandas.DataFrame: The modified DataFrame with the sampled data.
  """
  df = pd.read_csv(dataset_path)
  string_cols = [col for col, dtype in df.dtypes.items() if dtype == 'object']

  # for col in string_cols:
  #   le = LabelEncoder()
  #   df[col] = le.fit_transform(df[col])

  label_encoders = defaultdict(LabelEncoder)
  for col in string_cols:
    df[col] = label_encoders[col].fit_transform(df[col])
  


  if sampling_method in ['SMOTE', 'ADASYN', 'RandomOverSampler']:# Over-sampling methods

    # SMOTE (Synthetic Minority Over-sampling Technique)
    # Generates synthetic samples for the minority class by interpolating between existing minority class instances.
    # ADASYN (Adaptive Synthetic Sampling)
    # Extends SMOTE by focusing on generating synthetic samples in regions where the density of minority class instances is low.
    # RandomOverSampler
    # Randomly duplicates instances from the minority class to increase its representation in the dataset.

    X = df.drop(target_column, axis=1)
    y = df[target_column]

    #count 
    print("before sampling: ", Counter(y))

    if sampling_method == 'SMOTE':
      sampler = SMOTE(**kwargs)
    elif sampling_method == 'ADASYN':
      sampler = ADASYN(**kwargs)
    else:
      sampler = RandomOverSampler(**kwargs)
    X_res, y_res = sampler.fit_resample(X, y)
    df = pd.concat([X_res, y_res], axis=1)
    
    #count 
    print("after sampling: ", Counter(y_res))
  elif sampling_method in ['RandomUnderSampler', 'NearMiss', 'ClusterCentroids']:# Under-sampling methods

    # RandomUnderSampler
    # Randomly removes instances from the majority class to reduce its representation in the dataset.
    # NearMiss
    # Selects samples from the majority class that are close to the minority class based on distance metrics.
    # ClusterCentroids
    # Clusters the majority class instances and selects a representative subset from each cluster to reduce its size.

    X = df.drop(target_column, axis=1)
    y = df[target_column]
 
    #count 
    print("before sampling: ", Counter(y))

    if sampling_method == 'RandomUnderSampler':
      sampler = RandomUnderSampler(**kwargs)
    elif sampling_method == 'NearMiss':
      sampler = NearMiss(version=1, **kwargs)  # Version 1 recommended for most cases
    else:
      sampler = ClusterCentroids(**kwargs)
    X_res, y_res = sampler.fit_resample(X, y)
    df = pd.concat([X_res, y_res], axis=1)
    #count 
    print("after sampling: ", Counter(y_res))
  else:
    raise ValueError(f"Unsupported sampling method: {sampling_method}")

  # Inverse transform string columns
  for col in string_cols:
    df[col] = label_encoders[col].inverse_transform(df[col]) 

  return df