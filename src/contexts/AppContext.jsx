import React, { useState, createContext, useContext, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc, collection, addDoc, setDoc, getDoc, getDocs,
  updateDoc, onSnapshot, query, where,
  orderBy, serverTimestamp, writeBatch, limit
} from "firebase/firestore";
import { 
  genId, genPassword, genStudentId, genDiscountCode, now, formatFriendlyDate, ini, getMapTile 
} from "../utils";
import { REWARDS_PASSENGER, REWARDS_DRIVER, MAP_CONFIG, ADMIN_WHITELIST } from "../constants";
import { POINTS_TABLE } from "../utils/srmiUtils";

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [students, setStudents] = useState([]);
  const [rides, setRides] = useState([]);
  const [pending, setPending] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]); // Solicitudes "AHORA"
  const [view, setViewState] = useState(() => localStorage.getItem("pucmmcar_view") || "login");
  const [isDark, setIsDark] = useState(false);
  const processingRef = useRef(false);

  // Wrapper around setView to store it in localStorage instantly
  const setView = (v) => {
    localStorage.setItem("pucmmcar_view", v);
    setViewState(v);
  };


  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDark]);

  const [toast, setToast] = useState(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [mapRide, setMapRide] = useState(null);
  const [liveTracking, setLiveTrackingState] = useState(() => localStorage.getItem("pucmmcar_livetrack") || null);
  const [notifications, setNotifications] = useState({}); // { rideId: count }

  const setLiveTracking = (id) => {
    if (id) localStorage.setItem("pucmmcar_livetrack", id);
    else localStorage.removeItem("pucmmcar_livetrack");
    setLiveTrackingState(id);
  };

  const adminCredentialsRef = useRef({ email: null, password: null });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── OBSERVADOR DE AUTENTICACIÓN ─────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          let snap = await getDoc(userRef);
          
          let profile;
          if (snap.exists()) {
            profile = { id: fbUser.uid, ...snap.data() };
          } else {
            // Auto-creación de perfil si no existe (Social Login o nuevo registro)
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Estudiante",
              email: fbUser.email,
              role: "passenger", // Default seguro
              active: true, points: 0, rides: 0,
              idVerified: false, licenseVerified: false,
              redeemedCodes: [], createdAt: serverTimestamp(),
            };
            await setDoc(userRef, profile);
          }

          // 🛡️ SEGURIDAD: Validación de Lista Blanca Administrativa
          if (profile.role === "admin" && !ADMIN_WHITELIST.includes(profile.email)) {
            console.warn("Acceso admin denegado por correo no autorizado:", profile.email);
            // Intentamos degradar a pasajero EN MEMORIA para esta sesión
            profile.role = "passenger";
          }

          setUser(profile);
          
          // 🚀 LÓGICA DE REDIRECCIÓN POR ROL SELECCIONADO (CONDUCOTR VS PASAJERO)
          const selectedRole = localStorage.getItem("pucmmcar_selected_login_role");
          localStorage.removeItem("pucmmcar_selected_login_role"); 

          if (selectedRole === "driver" && profile.role !== "admin") {
            setView("createride");
          } else {
            // Restaurar vista persistente solo si es compatible con el rol
            const savedView = localStorage.getItem("pucmmcar_view");
            const isAdminView = savedView?.startsWith("admin_");
            
            if (savedView && savedView !== "login") {
              if (profile.role === "admin" && isAdminView) setView(savedView);
              else if (profile.role !== "admin" && !isAdminView) setView(savedView);
              else setView(profile.role === "admin" ? "admin_dash" : "search");
            } else {
              setView(profile.role === "admin" ? "admin_dash" : "search");
            }
          }

        } catch (err) {
          console.error("Error en observador de perfil:", err.message);
          // Fallback de emergencia
          setUser({ id: fbUser.uid, email: fbUser.email, role: "passenger", active: true, isOffline: true });
          setView("search");
        }
      } else {
        setUser(null);
        setView("login");
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // ── DATOS EN TIEMPO REAL ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const unsubRides = onSnapshot(
      query(collection(db, "rides"), where("status", "in", ["active", "completed", "cancelled"])),
      (snap) => setRides(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => { } // Silencio para evitar spam si las reglas están bloqueadas
    );

    let unsubStudents = () => { };
    if (user.role === "admin") {
      unsubStudents = onSnapshot(
        collection(db, "users"), 
        (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => { }
      );
    }

    // ── LISTENERS ADMINISTRATIVOS (Solo para Admins autorizados) ──
    let unsubPending = () => {};
    let unsubIncidents = () => {};
    let unsubRequests = () => {};

    if (user?.role === "admin") {
      unsubPending = onSnapshot(
        query(collection(db, "pending"), orderBy("submittedAt", "desc")),
        (snap) => setPending(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.warn("Admin listener error (pending):", err.message)
      );

      unsubIncidents = onSnapshot(
        query(collection(db, "incidents"), orderBy("createdAt", "desc")),
        (snap) => setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.warn("Admin listener error (incidents):", err.message)
      );

      unsubRequests = onSnapshot(
        query(collection(db, "requests"), where("status", "==", "pending")),
        (snap) => setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.warn("Admin listener error (requests):", err.message)
      );
    }

    // ── NOTIFICACIONES DE CHAT ──────────────────────────────────
    const unsubsChat = [];
    const activeRides = rides.filter(r => r.status === "active" && (r.driverId === user.id || r.passengers?.includes(user.id)));
    
    activeRides.forEach(ride => {
      const q = query(collection(db, "chats", ride.id, "messages"), orderBy("sentAt", "desc"), limit(1));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const lastMsg = snap.docs[0].data();
          if (lastMsg.senderId !== user.id && lastMsg.sentAt?.toMillis() > (Date.now() - 60000)) {
            setNotifications(prev => ({ ...prev, [ride.id]: (prev[ride.id] || 0) + 1 }));
          }
        }
      });
      unsubsChat.push(unsub);
    });

    return () => { 
      unsubRides(); unsubStudents(); unsubPending(); unsubIncidents(); unsubRequests();
      unsubsChat.forEach(u => u());
    };
  }, [user?.id, rides.length]);

  const clearNotifications = (rideId) => {
    setNotifications(prev => {
      const next = { ...prev };
      delete next[rideId];
      return next;
    });
  };

  // ── ACCIONES DE AUTENTICACIÓN ─────────────────────────────────
  const login = async (email, pw, selectedRole) => {
    try {
      // Guardar preferencia de inicio para la redirección
      localStorage.setItem("pucmmcar_selected_login_role", selectedRole);

      // Validar primero si intenta entrar como admin sin ser autorizado (UX rápida)
      if (selectedRole === "admin" && !ADMIN_WHITELIST.includes(email.trim().toLowerCase())) {
        return "Acceso denegado: Este correo no está autorizado como administrador.";
      }

      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pw);
      
      // Si llegamos aquí, las credenciales son válidas. 
      // El observador global 'onAuthStateChanged' se encargará de cargar el perfil.
      
      if (selectedRole === "admin") {
        adminCredentialsRef.current = { email: email.trim().toLowerCase(), password: pw };
      }
      
      // Mostramos bienvenida temporal mientras el observador carga los datos
      showToast(`Verificando acceso...`);
      return null;
    } catch (err) {
      console.error("Error de autenticación de Firebase:", err.code, err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        return "Credenciales inválidas. Verifica tu correo y clave.";
      }
      if (err.message.includes("permission-denied")) {
        return "Error de permisos. Contacta al administrador.";
      }
      return err.message;
    }
  };

  const logout = async () => {
    adminCredentialsRef.current = { email: null, password: null };
    await signOut(auth);
    setUser(null);
    setRides([]);
    setView("login");
    showToast("Sesión cerrada correctamente.", "info");
  };

  const updateUser = async (updates) => {
    setUser(p => ({ ...p, ...updates }));
    if (user?.id) {
      await updateDoc(doc(db, "users", user.id), { ...updates, updatedAt: serverTimestamp() });
    }
  };

  // ── LÓGICA DE NEGOCIO ─────────────────────────────────────────
  const upgradeToDriver = async ({ vehicle, plate }) => {
    if (!vehicle || !plate) return "Debes ingresar el vehículo y la placa.";
    const firstVehicle = {
      id: genId("vh"),
      brand: vehicle.split(" ")[0] || "Marca",
      model: vehicle.split(" ").slice(1).join(" ") || "Modelo",
      plate, color: "Desconocido", year: "—", status: "pending", isFavorite: true
    };
    await updateDoc(doc(db, "users", user.id), {
      role: "driver", vehicles: [firstVehicle], licenseVerified: "pending", updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "pending"), {
      userId: user.id, userName: user.name, userEmail: user.email,
      career: user.career || "—", studentId: user.studentId || "—",
      type: "license", fileName: "licencia_pendiente.jpg",
      status: "pending", submittedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "pending"), {
      userId: user.id, userName: user.name, userEmail: user.email,
      type: "vehicle", vehicleId: firstVehicle.id,
      brand: firstVehicle.brand, model: firstVehicle.model, plate: firstVehicle.plate,
      status: "pending", submittedAt: serverTimestamp(),
    });
    setUser(p => ({ ...p, role: "driver", vehicles: [firstVehicle], licenseVerified: "pending" }));
    showToast("¡Ahora eres conductor! Hemos guardado tu primer coche.");
    return null;
  };

  const addVehicle = async (data) => {
    const newVehicle = { id: genId("vh"), ...data, status: "pending", isFavorite: (user?.vehicles || []).length === 0 };
    const newVehicles = [...(user?.vehicles || []), newVehicle];
    await updateDoc(doc(db, "users", user.id), { vehicles: newVehicles, updatedAt: serverTimestamp() });
    await addDoc(collection(db, "pending"), {
      userId: user.id, userName: user.name, userEmail: user.email,
      type: "vehicle", vehicleId: newVehicle.id,
      brand: newVehicle.brand, model: newVehicle.model, plate: newVehicle.plate,
      status: "pending", submittedAt: serverTimestamp(),
    });
    setUser(p => ({ ...p, vehicles: newVehicles }));
    showToast("Vehículo agregado y enviado a verificación.");
  };

  const removeVehicle = async (vhId) => {
    const newVehicles = (user?.vehicles || []).filter(v => v.id !== vhId);
    await updateDoc(doc(db, "users", user.id), { vehicles: newVehicles, updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, vehicles: newVehicles }));
    showToast("Vehículo eliminado del garaje.");
  };

  const setFavoriteVehicle = async (vhId) => {
    const newVehicles = (user?.vehicles || []).map(v => ({ ...v, isFavorite: v.id === vhId }));
    await updateDoc(doc(db, "users", user.id), { vehicles: newVehicles, updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, vehicles: newVehicles }));
    showToast("Vehículo marcado como favorito.");
  };

  const downgradeToPassenger = async () => {
    await updateDoc(doc(db, "users", user.id), { role: "passenger", updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, role: "passenger" }));
    showToast("Cambiaste a modo Pasajero. Tus puntos y viajes se conservan.", "info");
  };

  const calcDiscount = (ride) => {
    if ((user?.rides || 0) === 0) return { pct: 100, label: "1er Viaje Gratis" };
    if (!ride?.date || !ride?.time) return { pct: 0, label: "Precio normal" };
    const rideMs = new Date(`${ride.date}T${ride.time}`).getTime();
    const diff = rideMs - Date.now();
    const hours = diff / (1000 * 60 * 60);
    if (hours >= 48) return { pct: 30, label: "30% descuento por reserva anticipada (+48h)" };
    if (hours >= 24) return { pct: 15, label: "15% descuento por reservar con un día de anticipación" };
    return { pct: 0, label: "Precio del día" };
  };

  const bookRide = async (rideId) => {
    if (processingRef.current) return false;
    processingRef.current = true;
    try {
      const ride = rides.find(r => r.id === rideId);
    if (!ride || ride.seatsLeft === 0 || ride.passengers?.includes(user?.id)) return false;
    const { pct } = calcDiscount(ride);
    const finalPrice = Math.round(ride.price * (1 - pct / 100));
    const rideRef = doc(db, "rides", rideId);
    await updateDoc(rideRef, {
      seatsLeft: ride.seatsLeft - 1,
      passengers: [...(ride.passengers || []), user.id],
      [`passengerPrice_${user.id}`]: finalPrice,
      updatedAt: serverTimestamp(),
    });
    const chatRef = doc(db, "chats", rideId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, { rideId, participants: [ride.driverId, user.id], createdAt: serverTimestamp() });
    } else {
      await updateDoc(chatRef, { participants: [...(chatSnap.data().participants || []), user.id] });
    }
      if (pct > 0) showToast(`¡Reservado con ${pct}% de descuento! Pagás RD$ ${finalPrice} `);
      else showToast("¡Asiento reservado! El conductor fue notificado ");
      return { ok: true, finalPrice, discountPct: pct };
    } finally {
      processingRef.current = false;
    }
  };

  const isValidCoord = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

  const createRide = async (data) => {
    if (processingRef.current) return null;
    processingRef.current = true;
    try {
      const fLat = data.from.lat;
    const fLng = data.from.lon || data.from.lng;
    const tLat = data.to.lat;
    const tLng = data.to.lon || data.to.lng;

    if (!isValidCoord(fLat) || !isValidCoord(fLng) || !isValidCoord(tLat) || !isValidCoord(tLng)) {
      showToast("Error: Ubicación inválida. Selecciona un lugar sugerido.", "error");
      return null;
    }

    const nr = {
      driverId: user.id, driverName: user.name, driverPhone: user.phone || "—",
      driverRating: 4.8, driverPhoto: user.photo || null, driverPoints: user.points || 0,
      vehicle: data.vehicle || "Vehículo personal", plate: data.plate || "—",
      from: data.from.name, fromLat: Number(fLat), fromLng: Number(fLng),
      to: data.to.name, toLat: Number(tLat), toLng: Number(tLng),
      date: data.date, time: data.time, seats: +data.seats, seatsLeft: +data.seats,
      price: +data.price, status: "active", passengers: [],
      preferences: data.preferences || [], gender: data.gender || "both",
      driverLat: Number(fLat), driverLng: Number(fLng), createdAt: serverTimestamp(),
      pickupPin: Math.floor(1000 + Math.random() * 9000).toString(),
    };
    const ref = await addDoc(collection(db, "rides"), nr);
    await updateDoc(doc(db, "users", user.id), { points: (user.points || 0) + 10, updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, points: (p.points || 0) + 10 }));
    showToast("¡Viaje publicado exitosamente! +10 puntos");
      setView("myrides");
      return ref.id;
    } finally {
      processingRef.current = false;
    }
  };

  const createRequest = async (data) => {
    if (processingRef.current) return null;
    processingRef.current = true;
    try {
      const fLat = data.from.lat;
    const fLng = data.from.lon || data.from.lng;
    const tLat = data.to.lat;
    const tLng = data.to.lon || data.to.lng;

    if (!isValidCoord(fLat) || !isValidCoord(fLng) || !isValidCoord(tLat) || !isValidCoord(tLng)) {
      showToast("Error: Ubicación inválida. Selecciona un lugar sugerido.", "error");
      return null;
    }

    const nr = {
      passengerId: user.id, passengerName: user.name, passengerPhoto: user.photo || null,
      from: data.from.name, fromLat: Number(fLat), fromLng: Number(fLng),
      to: data.to.name, toLat: Number(tLat), toLng: Number(tLng),
      price: +data.price || 250, status: "pending", createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "requests"), nr);
      showToast("Solicitud enviada. Buscando conductores cercanos...");
      return ref.id;
    } finally {
      processingRef.current = false;
    }
  };

  const cancelRequest = async (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    await updateDoc(doc(db, "requests", requestId), { status: "cancelled", cancelledAt: serverTimestamp() });
    showToast("Viaje cancelado exitosamente.", "info");
  };

  const acceptRequest = async (requestId) => {
    if (processingRef.current) return null;
    processingRef.current = true;
    try {
      const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const batch = writeBatch(db);
    const rideRef = doc(collection(db, "rides"));
    batch.set(rideRef, {
      driverId: user.id, driverName: user.name, driverPhone: user.phone || "—",
      driverRating: 4.8, driverPhoto: user.photo || null, driverPoints: user.points || 0,
      vehicle: (user?.vehicles?.find(v => v.isFavorite) || user?.vehicles?.[0])?.brand + " " + (user?.vehicles?.find(v => v.isFavorite) || user?.vehicles?.[0])?.model || "Vehículo personal",
      plate: (user?.vehicles?.find(v => v.isFavorite) || user?.vehicles?.[0])?.plate || "—",
      from: req.from, fromLat: req.fromLat, fromLng: req.fromLng,
      to: req.to, toLat: req.toLat, toLng: req.toLng,
      date: new Date().toISOString().split("T")[0], time: "AHORA",
      seats: 3, seatsLeft: 2, price: req.price, status: "active", passengers: [req.passengerId],
      [`passengerPrice_${req.passengerId}`]: req.price,
      driverLat: 18.4682, driverLng: -69.9333, createdAt: serverTimestamp(),
      pickupPin: Math.floor(1000 + Math.random() * 9000).toString(),
    });
    batch.update(doc(db, "requests", requestId), { status: "accepted", rideId: rideRef.id });
    await batch.commit();
    showToast(`Solicitud aceptada. En camino a buscar a ${req.passengerName}`);
      setView("livetrack");
      setLiveTracking(rideRef.id);
    } finally {
      processingRef.current = false;
    }
  };

  const submitRating = async (rideId, targetId, rating, comment) => {
    await addDoc(collection(db, "ratings"), {
      rideId, targetId, raterId: user.id, raterName: user.name, rating, comment, createdAt: serverTimestamp()
    });
    showToast("¡Gracias por tu calificación!");
  };

  const startRide = async (rideId, pinInput) => {
    const ride = rides.find(r => r.id === rideId);
    if (!ride) return;
    if (ride.pickupPin && ride.pickupPin !== pinInput) {
      showToast("PIN incorrecto. Verifica con el pasajero.", "error");
      return false;
    }
    await updateDoc(doc(db, "rides", rideId), { status: "on-way", startedAt: serverTimestamp() });
    showToast("¡Viaje iniciado! Sigue la ruta en el mapa.");
    return true;
  };

  const awardPoints = async (actionKey) => {
    if (!user) return;
    const pts = POINTS_TABLE[actionKey] || 0;
    if (pts === 0) return;

    const today = new Date().toISOString().split("T")[0];
    const puntosHoy = user.puntos_hoy?.date === today ? user.puntos_hoy.amount : 0;

    if (pts > 0 && puntosHoy + pts > POINTS_TABLE.MAX_DAILY_POINTS) {
      showToast("Límite diario de 150 PM alcanzado.", "info");
      return;
    }

    const newPointsToday = pts > 0 ? puntosHoy + pts : puntosHoy;
    const finalPoints = Math.max(0, (user.points || 0) + pts);

    await updateDoc(doc(db, "users", user.id), { 
      points: finalPoints,
      puntos_hoy: { date: today, amount: newPointsToday },
      updatedAt: serverTimestamp() 
    });
    
    setUser(p => ({ 
      ...p, 
      points: finalPoints,
      puntos_hoy: { date: today, amount: newPointsToday }
    }));

    if (pts > 0) showToast(`+${pts} PM por ${actionKey.replace('_', ' ')}`, "success");
    else showToast(`Penalidad: ${pts} PM.`, "error");
  };

  const confirmRide = async (rideId) => {
    await updateDoc(doc(db, "rides", rideId), { status: "completed", completedAt: serverTimestamp() });
    
    // Asignar puntos básicos
    const ride = rides.find(r => r.id === rideId);
    if (ride && user.id === ride.driverId) {
       await awardPoints("DRIVER_RIDE");
       if (ride.passengers?.length === 3) await awardPoints("FULL_CAR"); // Asumiendo 3 es lleno
    } else {
       await awardPoints("PASSENGER_RIDE");
    }

    // Actualizar viajes básicos (stats separadas de los puntos para la db)
    const uRef = doc(db, "users", user.id);
    await updateDoc(uRef, { rides: (user.rides || 0) + 1, updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, rides: (p.rides || 0) + 1 }));
    
    setView("search");
  };

  const cancelRide = async (rideId) => {
    await updateDoc(doc(db, "rides", rideId), { status: "cancelled", cancelledAt: serverTimestamp() });
    showToast("Viaje cancelado.", "info");
    
    const ride = rides.find(r => r.id === rideId);
    if (ride && user.id === ride.driverId) {
      await awardPoints("CANCEL_PENALTY");
      const uRef = doc(db, "users", user.id);
      await updateDoc(uRef, { cancelledRides: (user.cancelledRides || 0) + 1 });
      setUser(p => ({ ...p, cancelledRides: (p.cancelledRides || 0) + 1 }));
    }
    
    setView("search");
  };

  // ── VERIFICACIÓN ───────────────────────────────────────────────
  const verifyLicense = async () => {
    await updateDoc(doc(db, "users", user.id), { licenseVerified: "pending", updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, licenseVerified: "pending" }));
    await addDoc(collection(db, "pending"), {
      userId: user.id, userName: user.name, userEmail: user.email,
      career: user.career || "—", studentId: user.studentId || "—",
      type: "license", fileName: "licencia_subida.jpg", status: "pending", submittedAt: serverTimestamp(),
    });
    showToast("Licencia enviada para verificación. Proceso en 24h ");
  };

  const verifyStudentId = async () => {
    await updateDoc(doc(db, "users", user.id), { idVerified: "pending", updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, idVerified: "pending" }));
    await addDoc(collection(db, "pending"), {
      userId: user.id, userName: user.name, userEmail: user.email,
      career: user.career || "—", studentId: user.studentId || "—",
      type: "id", fileName: "carnet_subido.jpg", status: "pending", submittedAt: serverTimestamp(),
    });
    showToast("ID Estudiantil enviado. Verificación en 24h");
  };

  // ── SOS ────────────────────────────────────────────────────────
  const triggerSOS = async (location) => {
    const ride = liveTracking ? rides.find(r => r.id === liveTracking) : null;
    await addDoc(collection(db, "incidents"), {
      userId: user?.id, userName: user?.name, userPhone: user?.phone || "—",
      location: location || "Ubicación en vivo compartida",
      rideId: liveTracking || null, driverName: ride?.driverName || null,
      type: "ALERTA S.O.S.", status: "pending",
      note: `ALERTA CRÍTICA: ${user?.name} activó el botón de pánico.`,
      lat: ride?.driverLat || null, lng: ride?.driverLng || null, createdAt: serverTimestamp(),
    });
    showToast("S.O.S. ACTIVADO — Seguridad PUCMM está en camino", "error");
  };

  // ── RECOMPENSAS ───────────────────────────────────────────────
  const redeemReward = async (rewardId) => {
    const list = user?.role === "driver" ? REWARDS_DRIVER : REWARDS_PASSENGER;
    const reward = list.find(r => r.id === rewardId);
    if (!reward || (user?.points || 0) < reward.cost) return null;
    const code = genDiscountCode(user.name);
    const redeemedEntry = {
      rewardId, rewardTitle: reward.name, code, 
      redeemedAt: new Date().toLocaleString("es-DO"),
      redeemedAtIso: new Date().toISOString(),
      transferable: false, used: false,
    };
    const newPoints = (user.points || 0) - reward.cost;
    const newCodes = [...(user.redeemedCodes || []), redeemedEntry];
    await updateDoc(doc(db, "users", user.id), { points: newPoints, redeemedCodes: newCodes, updatedAt: serverTimestamp() });
    setUser(p => ({ ...p, points: newPoints, redeemedCodes: newCodes }));
    showToast(`¡Premio canjeado! Código: ${code}`);
    return code;
  };

  // ── SEGUIMIENTO EN VIVO ───────────────────────────────────────
  const startLiveTracking = (rideId) => { setLiveTracking(rideId); setView("livetrack"); };

  const startPublishingLocation = (rideId) => {
    if (!navigator.geolocation) return () => { };
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        updateDoc(doc(db, "rides", rideId), {
          driverLat: pos.coords.latitude, driverLng: pos.coords.longitude,
          locationUpdatedAt: serverTimestamp(),
        }).catch(() => { });
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  };

  const setHomeLocation = async (loc) => {
    await updateUser({ homeLocation: loc });
    showToast("Ubicación de casa guardada ");
  };

  // ── SERVICIOS DE MAPA ─────────────────────────────────────────
  const tomtomSearch = async (query) => {
    try {
      const { tomtomKey } = MAP_CONFIG;
      const res = await fetch(`https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${tomtomKey}&countrySet=DO&lat=18.486&lon=-69.941&radius=30000&limit=8`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.results.map(r => ({ 
        name: r.address.freeformAddress, 
        lat: Number(r.position.lat) || 18.486, 
        lon: Number(r.position.lon) || -69.941 
      }));
    } catch { return []; }
  };

  const tomtomReverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${MAP_CONFIG.tomtomKey}`);
      const data = await res.json();
      return data.addresses?.[0]?.address?.freeformAddress || "Ubicación desconocida";
    } catch { return "Error de ubicación"; }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getPriceEstimate = (dist) => Math.max(150, Math.round(dist * 60));

  // ── ACCIONES DE ADMINISTRADOR ─────────────────────────────────
  const adminApprove = async (pndId) => {
    const pnd = pending.find(p => p.id === pndId);
    if (!pnd) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "pending", pndId), { status: "approved" });
    if (pnd.type === "vehicle" && pnd.vehicleId) {
      const uRef = doc(db, "users", pnd.userId);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        const vhs = (uData.vehicles || []).map(v => v.id === pnd.vehicleId ? { ...v, status: "approved" } : v);
        batch.update(uRef, { vehicles: vhs, updatedAt: serverTimestamp() });
        if (user?.id === pnd.userId) setUser(p => ({ ...p, vehicles: vhs }));
      }
    } else {
      batch.update(doc(db, "users", pnd.userId), {
        [pnd.type === "license" ? "licenseVerified" : "idVerified"]: true,
        updatedAt: serverTimestamp(),
      });
      if (user?.id === pnd.userId) setUser(p => ({ ...p, [pnd.type === "license" ? "licenseVerified" : "idVerified"]: true }));
    }
    await batch.commit();
    showToast(` Verificación aprobada — ${pnd.userName}`);
  };

  const adminReject = async (pndId) => {
    const pnd = pending.find(p => p.id === pndId);
    if (!pnd) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "pending", pndId), { status: "rejected" });
    if (pnd.type === "vehicle" && pnd.vehicleId) {
      const uRef = doc(db, "users", pnd.userId);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        const vhs = (uData.vehicles || []).map(v => v.id === pnd.vehicleId ? { ...v, status: "rejected" } : v);
        batch.update(uRef, { vehicles: vhs, updatedAt: serverTimestamp() });
        if (user?.id === pnd.userId) setUser(p => ({ ...p, vehicles: vhs }));
      }
    } else {
      batch.update(doc(db, "users", pnd.userId), {
        [pnd.type === "license" ? "licenseVerified" : "idVerified"]: false,
        updatedAt: serverTimestamp(),
      });
      if (user?.id === pnd.userId) setUser(p => ({ ...p, [pnd.type === "license" ? "licenseVerified" : "idVerified"]: false }));
    }
    await batch.commit();
    showToast(`Verificación rechazada — ${pnd.userName}`, "error");
  };

  const adminToggleStudent = async (stuId) => {
    const stu = students.find(s => s.id === stuId);
    if (!stu) return;
    await updateDoc(doc(db, "users", stuId), { active: !stu.active, updatedAt: serverTimestamp() });
    showToast("Estado del estudiante actualizado.");
  };

  const adminAddStudent = async (data) => {
    const pw = genPassword();
    try {
      const adminEmail = adminCredentialsRef.current.email;
      const adminPw = adminCredentialsRef.current.password;
      const cred = await createUserWithEmailAndPassword(auth, data.email, pw);
      const newUid = cred.user.uid;
      const newProfile = {
        studentId: genStudentId(),
        name: data.name, email: data.email, career: data.career || "—", role: data.role || "passenger",
        idVerified: false, licenseVerified: false, active: true, rides: 0, points: 0,
        phone: data.phone || "—", photo: null, homeLocation: null, vehicle: null, plate: null, redeemedCodes: [],
        tempPassword: pw, passwordChanged: false, createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", newUid), newProfile);
      if (adminEmail && adminPw) await signInWithEmailAndPassword(auth, adminEmail, adminPw);
      showToast(` Estudiante ${data.name} creado exitosamente.`);
      return { id: newUid, ...newProfile, generatedPassword: pw };
    } catch (err) {
      showToast(`Error al crear estudiante: ${err.message}`, "error");
      return null;
    }
  };

  const changePassword = async (currentPw, newPw) => {
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      if (user?.id) {
        await updateDoc(doc(db, "users", user.id), { tempPassword: null, passwordChanged: true, updatedAt: serverTimestamp() });
        setUser(p => ({ ...p, tempPassword: null, passwordChanged: true }));
      }
      showToast("Contraseña actualizada correctamente ");
      return null;
    } catch (err) { return err.message; }
  };
  
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      showToast("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
      return null;
    } catch (err) { return err.message; }
  };

  const adminResetPassword = async (stuId) => {
    const stu = students.find(s => s.id === stuId);
    if (!stu) return;
    const newPw = genPassword();
    try {
      // Nota: En un entorno de producción real, el administrador usaría Firebase Admin SDK
      // Aquí actualizamos el documento de Firestore para que el usuario sea forzado a cambiarla
      // al detectar el campo tempPassword en el próximo login (o sesión activa).
      await updateDoc(doc(db, "users", stuId), {
        tempPassword: newPw,
        passwordChanged: false,
        updatedAt: serverTimestamp()
      });
      showToast(`Contraseña reseteada para ${stu.name}. Nueva clave: ${newPw}`, "info");
      return newPw;
    } catch (err) {
      showToast("Error al resetear contraseña", "error");
      return null;
    }
  };

  const adminResolveIncident = async (incId) => {
    await updateDoc(doc(db, "incidents", incId), { status: "resolved", resolvedAt: serverTimestamp() });
    showToast("Incidente marcado como resuelto ");
  };

  const value = {
    user, setUser: updateUser, students, setStudents,
    rides, pending, incidents, view, setView, isDark, setIsDark,
    toast, sosOpen, setSosOpen,
    login, logout, bookRide, acceptRequest,
    submitRating, startRide, finishRide: confirmRide, cancelRide,
    triggerSOS, mapRide, setMapRide, liveTracking, startLiveTracking, startPublishingLocation,
    verifyLicense, verifyStudentId, setHomeLocation,
    addVehicle, removeVehicle, setFavoriteVehicle,
    redeemReward, upgradeToDriver, downgradeToPassenger, changePassword, calcDiscount,
    adminApprove, adminReject, adminToggleStudent, adminAddStudent, adminResolveIncident, adminResetPassword,
    tomtomSearch, tomtomReverseGeocode, getDistance, getPriceEstimate, formatFriendlyDate,
    createRequest, cancelRequest, requests, notifications, clearNotifications, resetPassword,
  };

  if (!authReady) return (
    <AppContext.Provider value={value}>
      <div style={{ minHeight: "100vh", background: "#0033A0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #FFD100", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <div style={{ color: "#ffffff", marginTop: 16, fontSize: 13, opacity: 0.7 }}>Conectando con Firebase...</div>
        </div>
      </div>
    </AppContext.Provider>
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
