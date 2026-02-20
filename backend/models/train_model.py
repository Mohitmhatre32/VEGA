import os
import tensorflow as tf
from tensorflow.keras import layers, models, mixed_precision
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report

# ==========================================
# 1. HARDWARE SETUP (RTX 4050 OPTIMIZATION)
# ==========================================
# Enable Mixed Precision (Uses float16 for speed, float32 for stability)
policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_global_policy(policy)

print(f"TensorFlow Version: {tf.__version__}")
print(f"Compute Policy: {policy.compute_dtype}")
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅ GPU Detected: {gpus[0]}")
    except RuntimeError as e:
        print(e)
else:
    print("❌ WARNING: No GPU detected. Training will be slow.")

# ==========================================
# 2. CONFIGURATION
# ==========================================
DATA_DIR = 'dataset'  # FOLDER NAME WHERE YOUR IMAGES ARE
IMG_SIZE = (224, 224)
BATCH_SIZE = 32       # Increase to 64 if you have VRAM to spare
EPOCHS = 10           # 10 is enough for a hackathon demo
LEARNING_RATE = 0.0001

# ==========================================
# 3. DATA PIPELINE (i9 CPU Optimization)
# ==========================================
print("\n🚀 Loading Data...")

# Automatic Train/Val Split (80/20)
train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical' # Required for multi-class
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

# Capture class names for the final report
class_names = train_ds.class_names
print(f"✅ Classes Found: {class_names}")

# Performance Tuning: Prefetching to keep GPU busy
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# Data Augmentation Layer (Happens inside GPU)
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.1),
])

# ==========================================
# 4. MODEL ARCHITECTURE (ResNet50V2)
# ==========================================
print("\n🧠 Building Model (ResNet50V2)...")

# Load Pre-trained Base
base_model = tf.keras.applications.ResNet50V2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False # Freeze base

# Assemble the Head
inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
x = tf.keras.applications.resnet_v2.preprocess_input(x) # ResNet specific preprocessing
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x)
x = layers.Dense(128, activation='relu')(x)
# IMPORTANT: Output layer must be float32 for stability in Mixed Precision
outputs = layers.Dense(len(class_names), activation='softmax', dtype='float32')(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ==========================================
# 5. TRAINING
# ==========================================
print("\n🔥 Starting Training...")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    verbose=1
)

# ==========================================
# 6. EVALUATION & VISUALIZATION (Seaborn)
# ==========================================
print("\n📊 Generating Reports...")

# A. Accuracy/Loss Plots
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']

plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
sns.lineplot(data=pd.DataFrame({'Train Acc': acc, 'Val Acc': val_acc}))
plt.title('Accuracy')
plt.subplot(1, 2, 2)
sns.lineplot(data=pd.DataFrame({'Train Loss': loss, 'Val Loss': val_loss}))
plt.title('Loss')
plt.savefig('training_performance.png') # SAVE THIS FOR SLIDES
plt.show()

# B. Confusion Matrix
# Get predictions for validation set
y_true = []
y_pred = []

print("Running predictions for Confusion Matrix...")
for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    y_true.extend(np.argmax(labels.numpy(), axis=1))
    y_pred.extend(np.argmax(preds, axis=1))

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=class_names, yticklabels=class_names)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.savefig('confusion_matrix.png') # SAVE THIS FOR SLIDES
plt.show()

# ==========================================
# 7. SAVE ARTIFACTS
# ==========================================
model.save('isro_satellite_model.keras')
print("\n✅ Model saved to 'isro_satellite_model.keras'")

# Save class names for the backend team
with open('class_names.txt', 'w') as f:
    for name in class_names:
        f.write(name + '\n')
print("✅ Class names saved to 'class_names.txt'")