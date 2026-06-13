import os
import sys
import numpy as np

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings
from app.services.disease_info import DISEASE_METADATA

def train_disease_cnn():
    print("Loading TensorFlow for CNN model training...")
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
    except ImportError:
        print("TensorFlow not installed. Please install 'tensorflow' to run this script.")
        return

    # List of classes sorted alphabetically
    classes = sorted(list(DISEASE_METADATA.keys()))
    num_classes = len(classes)
    print(f"Target classes to classify ({num_classes}): {classes}")

    # Build a simple lightweight CNN for leaf image classification
    print("Constructing CNN architecture...")
    model = models.Sequential([
        layers.Conv2D(16, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()

    # Generate small simulated image arrays for validation of the script
    print("Creating simulated image data for training...")
    num_samples = 32
    X_train = np.random.uniform(0.0, 1.0, size=(num_samples, 224, 224, 3)).astype(np.float32)
    y_train = np.random.randint(0, num_classes, size=(num_samples,)).astype(np.int32)

    print("Running model fitting (1 epoch verification)...")
    model.fit(X_train, y_train, epochs=1, batch_size=8)

    # Save model
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODEL_DIR, "disease_model.h5")
    
    print(f"Saving trained weights to {model_path}...")
    model.save(model_path)
    print("CNN Disease Model training script completed successfully!")

if __name__ == "__main__":
    train_disease_cnn()
