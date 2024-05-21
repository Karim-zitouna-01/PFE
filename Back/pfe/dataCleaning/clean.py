import pandas as pd
import numpy as np

# necessary imports for KNN imputation
from sklearn.impute import KNNImputer
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.metrics import pairwise_distances_argmin_min
from sklearn.metrics import pairwise_distances
from sklearn.preprocessing import LabelEncoder
from fancyimpute import KNN

def impute_missing_values(dataset_path, column_name, imputation_method):
  """
  Imputes missing values in a CSV dataset using the chosen method.

  Args:
      dataset_path (str): Path to the CSV dataset file.
      imputation_method (str): Method for imputation (e.g., "mean", "median", "mode").

  Returns:
      pandas.DataFrame: The modified DataFrame with imputed missing values.

  """
  df = pd.read_csv(dataset_path)
  valid_methods = ['mean', 'median', 'mode', 'KNN_impute', 'Global_KNN_impute','listwise' ]
  if imputation_method not in valid_methods:
    raise ValueError(f"Invalid imputation method: {imputation_method}")

  if imputation_method == 'mean':
    df[column_name] = df[column_name].fillna(df[column_name].mean())
  elif imputation_method == 'median':
    df[column_name] = df[column_name].fillna(df[column_name].median())
  elif imputation_method == 'mode':
    df[column_name] = df[column_name].fillna(df[column_name].mode().iloc[0])
  
  elif imputation_method == 'listwise':
    df = df.dropna(subset=[column_name], thresh=0.5)

    # integer_columns = [col for col, dtype in df.dtypes.items() if dtype == 'int']
    # missing_per_column = df[column_name].isnull().mean()
    # if missing_per_column > 0.5:
    #   df = df.dropna(subset=[column_name], thresh=len(df) * 0.5)
    # for col in integer_columns:
    #   if col in df.columns:  # Check if column exists in the DataFrame
    #     df[col] = df[col].astype(int)
  
  #KNN imputation: specially for string data imputation (categorical data)
  elif imputation_method == 'Global_KNN_impute':
    # Impute missing values in the chosen column

    # Loop over columns to encode (optional)
    ordinal_enc_dict = {}
    for col_name in df:
        # Create ordinal encoder for the column (optional)
        ordinal_enc_dict[col_name] = OrdinalEncoder()
        col = df[col_name]

        # Select the non-null values in the column (optional)
        col_not_null = col[col.notnull()]

        # Check if there are non-null values before encoding (optional)
        if col_not_null.size > 0:
            reshaped_vals = col_not_null.values.reshape(-1, 1)
            # Encode the non-null values of the column (optional)
            encoded_vals = ordinal_enc_dict[col_name].fit_transform(reshaped_vals)
            # Replace the values in the column with ordinal values (optional)
            df.loc[col.notnull(), col_name] = np.squeeze(encoded_vals)

    # KNN Imputation
    df_KNN_imputed = df.copy(deep=True)
    # Create KNN imputer
    KNN_imputer = KNN()

    # Impute missing values in all columns (consider specifying a column)
    df_KNN_imputed.iloc[:, :] = KNN_imputer.fit_transform(df_KNN_imputed)

    # Optional inverse transformation for ordinal encoding (corrected)
    for col_name in df_KNN_imputed:
        if col_name in ordinal_enc_dict:  # Check if encoded
            reshaped_values = df_KNN_imputed[col_name].values.reshape(-1, 1)
            decoded_values = ordinal_enc_dict[col_name].inverse_transform(reshaped_values)
            df_KNN_imputed[col_name] = decoded_values.ravel()

    return df_KNN_imputed

  
  elif imputation_method == 'KNN_impute':
    # Impute missing values in the chosen column
    

    # Loop over columns to encode (optional)
    ordinal_enc_dict = {}
    for col_name in df:
        # Create ordinal encoder for the column (optional)
        ordinal_enc_dict[col_name] = OrdinalEncoder()
        col = df[col_name]

        # Select the non-null values in the column (optional)
        col_not_null = col[col.notnull()]

        # Check if there are non-null values before encoding (optional)
        if col_not_null.size > 0:
            reshaped_vals = col_not_null.values.reshape(-1, 1)
            # Encode the non-null values of the column (optional)
            encoded_vals = ordinal_enc_dict[col_name].fit_transform(reshaped_vals)
            # Replace the values in the column with ordinal values (optional)
            df.loc[col.notnull(), col_name] = np.squeeze(encoded_vals)

    # KNN Imputation
    df_KNN_imputed = df.copy(deep=True)
    # Create KNN imputer
    KNN_imputer = KNN()

    # Select the specified column and impute missing values
    imputed_data = KNN_imputer.fit_transform(df_KNN_imputed[[column_name]])
    df_KNN_imputed[column_name] = imputed_data[:, 0] 

    # Optional inverse transformation for ordinal encoding (corrected)
    for col_name in df_KNN_imputed:
        if col_name in ordinal_enc_dict:  # Check if encoded
            reshaped_values = df_KNN_imputed[col_name].values.reshape(-1, 1)
            decoded_values = ordinal_enc_dict[col_name].inverse_transform(reshaped_values)
            df_KNN_imputed[col_name] = decoded_values.ravel()

    return df_KNN_imputed

  
  
  return df



def handle_outliers(dataset_path, column_name, method, threshold=None):
  """
  Handles outliers in a specific column of a CSV dataset based on the chosen method.

  Args:
      dataset_path (str): Path to the CSV dataset file.
      column_name (str): Name of the column to handle outliers in.
      method (str): Method for handling outliers (e.g., 'remove', 'log', 'sqrt').
      threshold (float, optional): Threshold for outlier detection (used with 'remove').

  Returns:
      pandas.DataFrame: The modified DataFrame with outliers handled.
  """
  df = pd.read_csv(dataset_path)

  if method == 'remove':
    if threshold is None:
      raise ValueError("Threshold required for 'remove' method")
    iqr = df[column_name].quantile(0.75) - df[column_name].quantile(0.25)
    lower_bound = df[column_name].quantile(0.25) - (1.5 * iqr)
    upper_bound = df[column_name].quantile(0.75) + (1.5 * iqr)
    df = df[(df[column_name] >= lower_bound) & (df[column_name] <= upper_bound)]
  elif method == 'log':
    df[column_name] = np.log1p(df[column_name])  # Handle non-positive values
  elif method == 'sqrt':
    df[column_name] = df[column_name].apply(np.sqrt)  # Ensure non-negative values
  else:
    raise ValueError(f"Invalid outlier handling method: {method}")
  return df


