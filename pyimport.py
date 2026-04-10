import pandas as pd
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client.from_service_account_json('serviceAccountKey.json')

def import_csv(file_path, collection_name):
    df = pd.read_csv(file_path)
    # Convert dataframe to dictionary
    data = df.to_dict(orient='records')
    
    for item in data:
        db.collection(collection_name).add(item)
    print("Import Complete")

import_csv('public/workout_data.csv', 'hevy-visualizer')