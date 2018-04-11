import pandas as pd
from sklearn import preprocessing

df = pd.read_csv("normal_info.csv", ',',  index_col=0)
df = df.loc[df['filename'] == "mm/swapfile.c"]
print(df)
df.to_csv("memory.csv")
sum_of_additions = df['n_additions'].sum()
sum_of_deletions = df['n_deletions'].sum()

df['total_additions'] = sum_of_additions
df['total_deletions'] = sum_of_deletions

authors = df['author_id'].unique()

# Add empty column that will be filled with the author information
df['author_total_additions'] = 0
df['author_total_deletions'] = 0

'''
df['author_norm_additions'] = 0

scaler = preprocessing.StandardScaler()
df_author_additions = scaler.fit_transform(df[['n_additions']])
scaler = preprocessing.MinMaxScaler(feature_range=(0, 1))
df_author_additions = scaler.fit_transform(df_author_additions)
df['author_norm_additions'] = df_author_additions

scaler = preprocessing.StandardScaler()
dp_author_deletions = scaler.fit_transform(df[['n_deletions']])
scaler = preprocessing.MinMaxScaler(feature_range=(0, 1))
df_author_deletions = scaler.fit_transform(dp_author_deletions)
df['author_norm_deletions'] = df_author_deletions
df['author_norm_contribution'] = df_author_deletions + df_author_additions
'''

for author in authors:
	df_author = df.loc[df['author_id'] == author]
	sum_of_author_additions = df_author['n_additions'].sum()
	sum_of_author_deletions = df_author['n_deletions'].sum()
	df.loc[df['author_id'] == author, 'author_total_additions'] = sum_of_author_additions
	df.loc[df['author_id'] == author, 'author_total_deletions'] = sum_of_author_deletions

'''
authors_rank = pd.DataFrame(df[['author_total_additions', 'author_total_deletions']].sum(axis=1), columns =['total_author_contribution'])
authors_rank['author_id'] = df['author_id']
authors_rank = authors_rank.drop_duplicates()
authors_rank['rank'] = authors_rank['total_author_contribution'].rank(axis=0, ascending=0, method='first')

for author in authors:
	rank = authors_rank.loc[df['author_id'] == author, 'rank'].iloc[0]
	df.loc[df['author_id'] == author, 'rank'] = rank
df = df.sort_values('author_timestamp')'''
df.to_csv("memory.csv")
