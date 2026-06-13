import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

def generate_synthetic_soil_data(num_samples=1000):
    np.random.seed(42)
    
    crops = ["Rice", "Cotton", "Maize", "Tomato", "Wheat", "Groundnut"]
    data = []
    
    for _ in range(num_samples):
        crop = np.random.choice(crops)
        # Random inputs
        N = np.random.uniform(5, 100)
        P = np.random.uniform(5, 90)
        K = np.random.uniform(5, 90)
        pH = np.random.uniform(4.0, 9.5)
        moisture = np.random.uniform(10, 95)
        
        # Rule-based assignment of label to make ML model easily learn patterns
        if pH < 5.5:
            fertilizer = "Lime (Calcium Carbonate)"
        elif pH > 8.0:
            fertilizer = "Gypsum (Calcium Sulfate)"
        elif moisture < 20.0:
            fertilizer = "Organic Compost"
        elif N < 35.0:
            if P < 30.0:
                fertilizer = "DAP (Diammonium Phosphate)"
            else:
                fertilizer = "Urea"
        elif P < 30.0:
            fertilizer = "DAP (Diammonium Phosphate)"
        elif K < 35.0:
            fertilizer = "MOP (Muriate of Potash)"
        elif N < 50.0 and P < 50.0 and K < 50.0:
            fertilizer = "NPK 19-19-19"
        else:
            fertilizer = "Organic Compost"
            
        data.append([crop, N, P, K, pH, moisture, fertilizer])
        
    df = pd.DataFrame(data, columns=["crop_type", "N", "P", "K", "pH", "moisture", "fertilizer"])
    return df

def train_model():
    print("Generating synthetic soil dataset...")
    df = generate_synthetic_soil_data(1200)
    
    # Preprocess
    le_crop = LabelEncoder()
    df["crop_type_encoded"] = le_crop.fit_transform(df["crop_type"])
    
    X = df[["crop_type_encoded", "N", "P", "K", "pH", "moisture"]]
    y = df["fertilizer"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Model trained! Training Accuracy: {train_acc*100:.2f}%, Test Accuracy: {test_acc*100:.2f}%")
    
    # Save the model
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODEL_DIR, "fertilizer_model.pkl")
    
    try:
        import joblib
        model_data = {
            "model": model,
            "crop_encoder": le_crop
        }
        joblib.dump(model_data, model_path)
        print(f"Successfully saved fertilizer model to {model_path}")
    except ImportError:
        print("joblib package not found. Install joblib to save the model.")

if __name__ == "__main__":
    train_model()
