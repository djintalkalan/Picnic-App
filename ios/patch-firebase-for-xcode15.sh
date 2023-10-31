echo "Patching firestore to fix build issue in Xcode 15"
sed -i '' 's/ABSL_CONST_INIT//g' Pods/FirebaseFirestore/Firestore/Source/API/FIRFirestoreSettings.mm