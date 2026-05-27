// dbService.js - Database abstraction layer with Firebase and LocalStorage support
import { firebaseConfig, isFirebaseConfigured } from "../firebaseConfig.js";

// Preloaded mock database records
const MOCK_USERS = [
  { uid: "usr-1", name: "Ravi Sir (Owner)", username: "owner", password: "123", role: "super_admin", mobile: "9988776655", status: "active" },
  { uid: "usr-2", name: "Suresh Kadam (Manager)", username: "suresh", password: "123", role: "admin", mobile: "9876543210", status: "active" },
  { uid: "usr-3", name: "Priya Jadhav (Clerk In-charge)", username: "priya", password: "123", role: "admin", mobile: "9876543211", status: "active" },
  { uid: "usr-4", name: "Rakesh Patil (Operator)", username: "rakesh", password: "123", role: "clerk", mobile: "9876543212", status: "active" },
  { uid: "usr-5", name: "Anil Deshmukh (Operator)", username: "anil", password: "123", role: "clerk", mobile: "9876543213", status: "active" },
  { uid: "usr-6", name: "Savita Shinde (Operator)", username: "savita", password: "123", role: "clerk", mobile: "9876543214", status: "active" },
  { uid: "usr-7", name: "Yogesh Pawar (Operator)", username: "yogesh", password: "123", role: "clerk", mobile: "9876543215", status: "active" }
];

const MOCK_STUDENTS = [
  { id: "std-1", admissionId: "CPTC-2026-001", name: "Atul Ramesh Patil", mobile: "9823456789", parentMobile: "9012345678", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 20000, pendingFees: 25000, status: "Active", createdAt: "2026-05-20T10:00:00.000Z" },
  { id: "std-2", admissionId: "CPTC-2026-002", name: "Sunil Dashrath More", mobile: "9823456790", parentMobile: "9012345679", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 45000, pendingFees: 0, status: "Completed", createdAt: "2026-05-21T11:30:00.000Z" },
  { id: "std-3", admissionId: "CPTC-2026-003", name: "Komal Suresh Shinde", mobile: "9823456791", parentMobile: "9012345680", course: "ADXRT", batch: "2025-2026", totalFees: 50000, paidFees: 15000, pendingFees: 35000, status: "Active", createdAt: "2026-05-22T09:15:00.000Z" },
  { id: "std-4", admissionId: "CPTC-2026-004", name: "Rohan Nitin Deshmukh", mobile: "9823456792", parentMobile: "9012345681", course: "ADXRT", batch: "2025-2026", totalFees: 50000, paidFees: 10000, pendingFees: 40000, status: "Active", createdAt: "2026-05-23T14:40:00.000Z" },
  { id: "std-5", admissionId: "CPTC-2026-005", name: "Pragati Vilas Gawande", mobile: "9823456793", parentMobile: "9012345682", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 30000, pendingFees: 15000, status: "Active", createdAt: "2026-05-24T10:10:00.000Z" },
  { id: "std-6", admissionId: "CPTC-2026-006", name: "Shubham Vinayak Kale", mobile: "9823456794", parentMobile: "9012345683", course: "ADXRT", batch: "2025-2026", totalFees: 50000, paidFees: 0, pendingFees: 50000, status: "Active", createdAt: "2026-05-25T16:20:00.000Z" },
  { id: "std-7", admissionId: "CPTC-2026-007", name: "Snehal Arjun Thorat", mobile: "9823456795", parentMobile: "9012345684", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 15000, pendingFees: 30000, status: "Active", createdAt: "2026-05-26T12:05:00.000Z" },
  { id: "std-8", admissionId: "CPTC-2026-008", name: "Akash Baburao Gite", mobile: "9823456796", parentMobile: "9012345685", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 40000, pendingFees: 5000, status: "Active", createdAt: "2026-05-26T13:45:00.000Z" },
  { id: "std-9", admissionId: "CPTC-2026-009", name: "Pooja Sanjay Wagh", mobile: "9823456797", parentMobile: "9012345686", course: "ADXRT", batch: "2025-2026", totalFees: 50000, paidFees: 25000, pendingFees: 25000, status: "Active", createdAt: "2026-05-27T09:20:00.000Z" },
  { id: "std-10", admissionId: "CPTC-2026-010", name: "Vikas Ratan Rathod", mobile: "9823456798", parentMobile: "9012345687", course: "ADMLT", batch: "2025-2026", totalFees: 45000, paidFees: 10000, pendingFees: 35000, status: "Active", createdAt: "2026-05-27T10:30:00.000Z" }
];

const MOCK_TRANSACTIONS = [
  { id: "tx-1", studentId: "std-1", studentName: "Atul Ramesh Patil", admissionId: "CPTC-2026-001", course: "ADMLT", receiptNo: "REC-2026-1001", amount: 12000, paymentMethod: "Cash", transactionId: "", date: "2026-05-20T10:15:00.000Z", collectedBy: "Priya Jadhav (Clerk In-charge)", remarks: "Admission Booking" },
  { id: "tx-2", studentId: "std-1", studentName: "Atul Ramesh Patil", admissionId: "CPTC-2026-001", course: "ADMLT", receiptNo: "REC-2026-1002", amount: 8000, paymentMethod: "UPI", transactionId: "TXN9283749811", date: "2026-05-25T11:00:00.000Z", collectedBy: "Rakesh Patil (Operator)", remarks: "Term 1 Fees" },
  { id: "tx-3", studentId: "std-2", studentName: "Sunil Dashrath More", admissionId: "CPTC-2026-002", course: "ADMLT", receiptNo: "REC-2026-1003", amount: 20000, paymentMethod: "Net Banking", transactionId: "REF00827361", date: "2026-05-21T11:45:00.000Z", collectedBy: "Priya Jadhav (Clerk In-charge)", remarks: "Booking" },
  { id: "tx-4", studentId: "std-2", studentName: "Sunil Dashrath More", admissionId: "CPTC-2026-002", course: "ADMLT", receiptNo: "REC-2026-1004", amount: 25000, paymentMethod: "UPI", transactionId: "TXN102938475", date: "2026-05-26T14:10:00.000Z", collectedBy: "Anil Deshmukh (Operator)", remarks: "Full settlement" },
  { id: "tx-5", studentId: "std-3", studentName: "Komal Suresh Shinde", admissionId: "CPTC-2026-003", course: "ADXRT", receiptNo: "REC-2026-1005", amount: 15000, paymentMethod: "Cash", transactionId: "", date: "2026-05-22T09:30:00.000Z", collectedBy: "Savita Shinde (Operator)", remarks: "Admission booking" },
  { id: "tx-6", studentId: "std-4", studentName: "Rohan Nitin Deshmukh", admissionId: "CPTC-2026-004", course: "ADXRT", receiptNo: "REC-2026-1006", amount: 10000, paymentMethod: "Card", transactionId: "CARD_MID_9201", date: "2026-05-23T15:00:00.000Z", collectedBy: "Yogesh Pawar (Operator)", remarks: "First Installment" },
  { id: "tx-7", studentId: "std-5", studentName: "Pragati Vilas Gawande", admissionId: "CPTC-2026-005", course: "ADMLT", receiptNo: "REC-2026-1007", amount: 15000, paymentMethod: "UPI", transactionId: "UPI77625149", date: "2026-05-24T10:30:00.000Z", collectedBy: "Rakesh Patil (Operator)", remarks: "Installment 1" },
  { id: "tx-8", studentId: "std-5", studentName: "Pragati Vilas Gawande", admissionId: "CPTC-2026-005", course: "ADMLT", receiptNo: "REC-2026-1008", amount: 15000, paymentMethod: "Cash", transactionId: "", date: "2026-05-27T09:40:00.000Z", collectedBy: "Savita Shinde (Operator)", remarks: "Installment 2" },
  { id: "tx-9", studentId: "std-7", studentName: "Snehal Arjun Thorat", admissionId: "CPTC-2026-007", course: "ADMLT", receiptNo: "REC-2026-1009", amount: 15000, paymentMethod: "UPI", transactionId: "UPI881762512", date: "2026-05-26T12:20:00.000Z", collectedBy: "Yogesh Pawar (Operator)", remarks: "Booking" },
  { id: "tx-10", studentId: "std-8", studentName: "Akash Baburao Gite", admissionId: "CPTC-2026-008", course: "ADMLT", receiptNo: "REC-2026-1010", amount: 20000, paymentMethod: "Cash", transactionId: "", date: "2026-05-26T14:00:00.000Z", collectedBy: "Anil Deshmukh (Operator)", remarks: "First Installment" },
  { id: "tx-11", studentId: "std-8", studentName: "Akash Baburao Gite", admissionId: "CPTC-2026-008", course: "ADMLT", receiptNo: "REC-2026-1011", amount: 20000, paymentMethod: "UPI", transactionId: "UPI889201928", date: "2026-05-27T10:00:00.000Z", collectedBy: "Priya Jadhav (Clerk In-charge)", remarks: "Installment 2" },
  { id: "tx-12", studentId: "std-9", studentName: "Pooja Sanjay Wagh", admissionId: "CPTC-2026-009", course: "ADXRT", receiptNo: "REC-2026-1012", amount: 25000, paymentMethod: "UPI", transactionId: "UPI92910283", date: "2026-05-27T10:15:00.000Z", collectedBy: "Rakesh Patil (Operator)", remarks: "Booking & Term 1" },
  { id: "tx-13", studentId: "std-10", studentName: "Vikas Ratan Rathod", admissionId: "CPTC-2026-010", course: "ADMLT", receiptNo: "REC-2026-1013", amount: 10000, paymentMethod: "Cash", transactionId: "", date: "2026-05-27T11:00:00.000Z", collectedBy: "Anil Deshmukh (Operator)", remarks: "Booking" }
];

const MOCK_LOGS = [
  { id: "log-1", timestamp: "2026-05-27T08:00:00.000Z", userName: "System", action: "Database initialized with preloaded records", type: "system" }
];

// Initialize LocalStorage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem("cptc_students")) {
    localStorage.setItem("cptc_students", JSON.stringify(MOCK_STUDENTS));
  }
  if (!localStorage.getItem("cptc_transactions")) {
    localStorage.setItem("cptc_transactions", JSON.stringify(MOCK_TRANSACTIONS));
  }
  if (!localStorage.getItem("cptc_logs")) {
    localStorage.setItem("cptc_logs", JSON.stringify(MOCK_LOGS));
  }
  if (!localStorage.getItem("cptc_users")) {
    localStorage.setItem("cptc_users", JSON.stringify(MOCK_USERS));
  }
};

// Check and bootstrap
initLocalStorage();

// Firebase SDK lazy loading helpers
let db = null;
let auth = null;

const setupFirebase = async () => {
  if (isFirebaseConfigured() && !db) {
    try {
      // Import the official modules from google CDN
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
      const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      console.log("Firebase initialized successfully.");
    } catch (e) {
      console.error("Firebase SDK failed to load. Operating in LocalStorage mode.", e);
    }
  }
};

// Initialize Firebase if configured
setupFirebase();

// Logger helper
const writeLog = (action, type, userName) => {
  const newLog = {
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    userName: userName || "Unknown User",
    action,
    type
  };
  
  if (isFirebaseConfigured() && db) {
    // Write asynchronously to firebase
    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(({ collection, addDoc }) => {
      addDoc(collection(db, "logs"), newLog);
    });
  } else {
    const logs = JSON.parse(localStorage.getItem("cptc_logs") || "[]");
    logs.unshift(newLog);
    // Keep max 500 logs locally
    if (logs.length > 500) logs.pop();
    localStorage.setItem("cptc_logs", JSON.stringify(logs));
  }
};

export const dbService = {
  isFirebase: () => {
    return isFirebaseConfigured() && db !== null;
  },

  // Auth Operations
  signIn: async (username, password) => {
    await setupFirebase();
    
    if (isFirebaseConfigured() && auth && db) {
      // Real firebase auth implementation via users lookup or auth register
      try {
        const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
        // In actual system, we can map staff username to email 'username@cptc.com'
        const email = `${username.toLowerCase()}@cptc.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Fetch role from Firestore 'users' collection
        const q = query(collection(db, "users"), where("uid", "==", firebaseUser.uid));
        const querySnapshot = await getDocs(q);
        
        let userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || username,
          username: username,
          role: "clerk", // fallback
          status: "active"
        };
        
        querySnapshot.forEach((doc) => {
          userData = { ...userData, ...doc.data() };
        });
        
        writeLog(`User logged in successfully (Firebase)`, "login", userData.name);
        return userData;
      } catch (err) {
        console.error("Firebase signin error, trying mock local user fallback", err);
        throw new Error(err.message || "Invalid credentials");
      }
    } else {
      // Local Storage mock authentication
      const users = JSON.parse(localStorage.getItem("cptc_users") || "[]");
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      
      if (user) {
        if (user.status !== "active") {
          throw new Error("This account is currently deactivated");
        }
        writeLog(`User logged in: ${user.name}`, "login", user.name);
        // Return without password for security
        return {
          uid: user.uid,
          name: user.name,
          username: user.username,
          role: user.role,
          mobile: user.mobile,
          status: user.status
        };
      } else {
        throw new Error("Invalid username or password");
      }
    }
  },

  // Student Operations
  getStudents: async () => {
    if (isFirebaseConfigured() && db) {
      try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const querySnapshot = await getDocs(collection(db, "students"));
        const students = [];
        querySnapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() });
        });
        return students;
      } catch (err) {
        console.error(err);
      }
    }
    return JSON.parse(localStorage.getItem("cptc_students") || "[]");
  },

  addStudent: async (studentData, activeUser) => {
    // Generate new ID
    const newId = "std-" + Date.now();
    const total = Number(studentData.totalFees) || 0;
    const paid = Number(studentData.paidFees) || 0;
    const pending = total - paid;
    
    // Automatically determine status based on balances
    let status = "Active";
    if (paid >= total && total > 0) status = "Completed";
    
    const newStudent = {
      admissionId: studentData.admissionId || `CPTC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: studentData.name,
      mobile: studentData.mobile,
      parentMobile: studentData.parentMobile || "",
      course: studentData.course,
      batch: studentData.batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      totalFees: total,
      paidFees: paid,
      pendingFees: pending,
      status: studentData.status || status,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(db, "students"), newStudent);
      newStudent.id = docRef.id;
    } else {
      newStudent.id = newId;
      const students = JSON.parse(localStorage.getItem("cptc_students") || "[]");
      // Prevent duplicate Admission ID
      if (students.some(s => s.admissionId === newStudent.admissionId)) {
        throw new Error(`Admission ID ${newStudent.admissionId} already exists!`);
      }
      students.push(newStudent);
      localStorage.setItem("cptc_students", JSON.stringify(students));
    }
    
    // Log the transaction if initial fees paid is > 0
    if (paid > 0) {
      await dbService.recordPayment({
        studentId: newStudent.id,
        studentName: newStudent.name,
        admissionId: newStudent.admissionId,
        course: newStudent.course,
        amount: paid,
        paymentMethod: "Cash",
        transactionId: "",
        remarks: "Admission Fee (Initial Paid)"
      }, activeUser, false); // false means do not update student balance again
    }

    writeLog(`Added student ${newStudent.name} (${newStudent.admissionId})`, "student_create", activeUser.name);
    return newStudent;
  },

  editStudent: async (id, studentData, activeUser) => {
    const total = Number(studentData.totalFees) || 0;
    const paid = Number(studentData.paidFees) || 0;
    const pending = total - paid;
    let status = studentData.status || "Active";
    if (paid >= total && total > 0) status = "Completed";

    const updateFields = {
      name: studentData.name,
      mobile: studentData.mobile,
      parentMobile: studentData.parentMobile || "",
      course: studentData.course,
      batch: studentData.batch,
      totalFees: total,
      paidFees: paid,
      pendingFees: pending,
      status: status
    };

    if (isFirebaseConfigured() && db) {
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const ref = doc(db, "students", id);
      await updateDoc(ref, updateFields);
    } else {
      const students = JSON.parse(localStorage.getItem("cptc_students") || "[]");
      const index = students.findIndex(s => s.id === id);
      if (index === -1) throw new Error("Student not found");
      
      // Keep ID and createdAt
      students[index] = { ...students[index], ...updateFields };
      localStorage.setItem("cptc_students", JSON.stringify(students));
    }

    writeLog(`Updated student info for ${studentData.name} (${studentData.admissionId})`, "student_edit", activeUser.name);
    return { id, ...updateFields };
  },

  deleteStudent: async (id, activeUser) => {
    let studentName = "";
    if (isFirebaseConfigured() && db) {
      const { doc, getDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const ref = doc(db, "students", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        studentName = snap.data().name;
        await deleteDoc(ref);
      }
    } else {
      const students = JSON.parse(localStorage.getItem("cptc_students") || "[]");
      const index = students.findIndex(s => s.id === id);
      if (index === -1) throw new Error("Student not found");
      studentName = students[index].name;
      students.splice(index, 1);
      localStorage.setItem("cptc_students", JSON.stringify(students));
    }

    writeLog(`Deleted student record for ${studentName} (ID: ${id})`, "student_delete", activeUser.name);
    return true;
  },

  // Payment Operations
  recordPayment: async (paymentData, activeUser, updateStudentDetails = true) => {
    const amount = Number(paymentData.amount);
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const receiptNo = `REC-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`;
    const newTx = {
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      admissionId: paymentData.admissionId,
      course: paymentData.course,
      receiptNo,
      amount,
      paymentMethod: paymentData.paymentMethod || "Cash",
      transactionId: paymentData.transactionId || "",
      date: new Date().toISOString(),
      collectedBy: activeUser.name,
      remarks: paymentData.remarks || ""
    };

    if (isFirebaseConfigured() && db) {
      const { collection, addDoc, doc, runTransaction } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      
      if (updateStudentDetails) {
        // Use a Firestore transaction to update student balance safely
        await runTransaction(db, async (transaction) => {
          const studentRef = doc(db, "students", paymentData.studentId);
          const studentDoc = await transaction.get(studentRef);
          
          if (!studentDoc.exists()) {
            throw new Error("Student record does not exist!");
          }
          
          const sData = studentDoc.data();
          const newPaid = Number(sData.paidFees) + amount;
          const newPending = Number(sData.totalFees) - newPaid;
          const newStatus = (newPaid >= Number(sData.totalFees)) ? "Completed" : sData.status;
          
          transaction.update(studentRef, {
            paidFees: newPaid,
            pendingFees: newPending,
            status: newStatus
          });
        });
      }
      
      const docRef = await addDoc(collection(db, "transactions"), newTx);
      newTx.id = docRef.id;
    } else {
      newTx.id = "tx-" + Date.now();
      
      const transactions = JSON.parse(localStorage.getItem("cptc_transactions") || "[]");
      transactions.unshift(newTx);
      localStorage.setItem("cptc_transactions", JSON.stringify(transactions));

      if (updateStudentDetails) {
        const students = JSON.parse(localStorage.getItem("cptc_students") || "[]");
        const idx = students.findIndex(s => s.id === paymentData.studentId);
        if (idx !== -1) {
          const s = students[idx];
          s.paidFees = Number(s.paidFees) + amount;
          s.pendingFees = Number(s.totalFees) - s.paidFees;
          if (s.paidFees >= s.totalFees) s.status = "Completed";
          localStorage.setItem("cptc_students", JSON.stringify(students));
        }
      }
    }

    writeLog(`Collected ₹${amount} from ${paymentData.studentName} (Receipt: ${receiptNo})`, "payment", activeUser.name);
    return newTx;
  },

  getTransactions: async () => {
    if (isFirebaseConfigured() && db) {
      try {
        const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const q = query(collection(db, "transactions"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
        return transactions;
      } catch (err) {
        console.error(err);
      }
    }
    return JSON.parse(localStorage.getItem("cptc_transactions") || "[]");
  },

  // Audit Logs
  getActivityLogs: async () => {
    if (isFirebaseConfigured() && db) {
      try {
        const { collection, getDocs, query, orderBy, limit } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        return logs;
      } catch (err) {
        console.error(err);
      }
    }
    return JSON.parse(localStorage.getItem("cptc_logs") || "[]");
  },

  // Import System
  importStudents: async (rows, activeUser) => {
    const students = JSON.parse(localStorage.getItem("cptc_students") || "[]");
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      if (!row.name || !row.course) continue;
      
      const admissionId = row.admissionId || `CPTC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const totalFees = Number(row.totalFees) || (row.course === "ADMLT" ? 45000 : 50000);
      const paidFees = Number(row.paidFees) || 0;
      const pendingFees = totalFees - paidFees;
      const status = paidFees >= totalFees ? "Completed" : "Active";
      
      // Match by Admission ID or Mobile + Name
      const matchIdx = students.findIndex(s => 
        s.admissionId.trim().toLowerCase() === admissionId.trim().toLowerCase() ||
        (s.mobile.trim() === String(row.mobile || '').trim() && s.name.trim().toLowerCase() === row.name.trim().toLowerCase())
      );

      if (matchIdx !== -1) {
        // Merge records
        const existing = students[matchIdx];
        
        // Accumulate paid fees if requested or just update to the higher one
        const oldPaid = Number(existing.paidFees);
        const newPaid = Math.max(oldPaid, paidFees); // Take higher or accumulate? Here we take higher/overwrite.
        
        students[matchIdx] = {
          ...existing,
          name: row.name || existing.name,
          mobile: row.mobile || existing.mobile,
          parentMobile: row.parentMobile || existing.parentMobile,
          course: row.course || existing.course,
          batch: row.batch || existing.batch,
          totalFees: totalFees || existing.totalFees,
          paidFees: newPaid,
          pendingFees: (totalFees || existing.totalFees) - newPaid,
          status: newPaid >= (totalFees || existing.totalFees) ? "Completed" : "Active"
        };
        updated++;
      } else {
        // Insert new
        const newStudent = {
          id: "std-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          admissionId,
          name: row.name,
          mobile: String(row.mobile || ""),
          parentMobile: String(row.parentMobile || ""),
          course: row.course,
          batch: row.batch || "2025-2026",
          totalFees,
          paidFees,
          pendingFees,
          status,
          createdAt: new Date().toISOString()
        };
        students.push(newStudent);
        
        // Log transaction if imported paid amount > 0
        if (paidFees > 0) {
          const receiptNo = `REC-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`;
          const tx = {
            id: "tx-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            studentId: newStudent.id,
            studentName: newStudent.name,
            admissionId: newStudent.admissionId,
            course: newStudent.course,
            receiptNo,
            amount: paidFees,
            paymentMethod: "Cash",
            transactionId: "",
            date: new Date().toISOString(),
            collectedBy: activeUser.name,
            remarks: "Imported Balance"
          };
          const transactions = JSON.parse(localStorage.getItem("cptc_transactions") || "[]");
          transactions.unshift(tx);
          localStorage.setItem("cptc_transactions", JSON.stringify(transactions));
        }
        
        inserted++;
      }
    }

    if (isFirebaseConfigured() && db) {
      // Sync all to Firestore (simplified in fallback, in reality write doc by doc or batch)
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      for (const s of students) {
        await setDoc(doc(db, "students", s.id), s);
      }
    } else {
      localStorage.setItem("cptc_students", JSON.stringify(students));
    }

    writeLog(`Imported Excel dataset: Added ${inserted}, Merged ${updated} records`, "excel_import", activeUser.name);
    return { inserted, updated };
  },

  // Backups
  exportBackup: () => {
    const data = {
      students: JSON.parse(localStorage.getItem("cptc_students") || "[]"),
      transactions: JSON.parse(localStorage.getItem("cptc_transactions") || "[]"),
      users: JSON.parse(localStorage.getItem("cptc_users") || "[]"),
      logs: JSON.parse(localStorage.getItem("cptc_logs") || "[]"),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  restoreBackup: async (jsonString, activeUser) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.students || !data.transactions) {
        throw new Error("Invalid backup file format");
      }
      
      localStorage.setItem("cptc_students", JSON.stringify(data.students));
      localStorage.setItem("cptc_transactions", JSON.stringify(data.transactions));
      if (data.users) localStorage.setItem("cptc_users", JSON.stringify(data.users));
      if (data.logs) localStorage.setItem("cptc_logs", JSON.stringify(data.logs));

      if (isFirebaseConfigured() && db) {
        // Sync to firebase
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        for (const s of data.students) {
          await setDoc(doc(db, "students", s.id), s);
        }
        for (const tx of data.transactions) {
          await setDoc(doc(db, "transactions", tx.id), tx);
        }
      }

      writeLog("Restored database from local JSON backup snapshot", "backup", activeUser.name);
      return true;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to restore: " + err.message);
    }
  },

  // Super Admin: User/Staff management
  getStaff: () => {
    return JSON.parse(localStorage.getItem("cptc_users") || "[]");
  },

  saveStaff: (staffList, activeUser) => {
    localStorage.setItem("cptc_users", JSON.stringify(staffList));
    writeLog("Updated staff credentials and permissions layout", "system", activeUser.name);
    return true;
  }
};
export default dbService;
