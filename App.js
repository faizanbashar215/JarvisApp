import { useState, useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, SafeAreaView, Animated, Dimensions,
  PanResponder, Platform, KeyboardAvoidingView, Modal, Vibration
} from "react-native";

const { width, height } = Dimensions.get("window");
const DEFAULT_IP = "10.139.106.157";
let API = `http://${DEFAULT_IP}:8000`;

const C = {
  bg: "#000510", blue: "#00D4FF", green: "#00FF88",
  orange: "#FF6B00", red: "#FF3366", purple: "#9D00FF",
  dim: "#003344", card: "#000D1A", text: "#CCF5FF",
};

const haptic = () => Vibration.vibrate(50);

// ===== API HELPER =====
const api = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${API}${endpoint}`);
      return await res.json();
    } catch { return null; }
  },
  post: async (endpoint, body) => {
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch { return null; }
  }
};

// ===== ANIMATIONS =====
function GlitchText({ text, style }) {
  const [g, setG] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setG(true);
      setTimeout(() => setG(false), 80);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);
  return <Text style={[style, g && { opacity: 0.6 }]}>{text}</Text>;
}

function TypewriterText({ text, style, speed = 20 }) {
  const [d, setD] = useState("");
  useEffect(() => {
    setD("");
    let i = 0;
    const t = setInterval(() => {
      if (i < text.length) { setD(text.slice(0, ++i)); }
      else clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <Text style={style}>{d}</Text>;
}

function Ring({ size, color, speed, delay, reverse }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rot, {
      toValue: 1, duration: speed || 4000,
      delay: delay || 0, useNativeDriver: true,
    })).start();
  }, []);
  const spin = rot.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ["360deg", "0deg"] : ["0deg", "360deg"],
  });
  return (
    <Animated.View style={{
      position: "absolute", width: size, height: size,
      borderRadius: size / 2, borderWidth: 1,
      borderColor: color || C.blue, borderStyle: "dashed",
      transform: [{ rotate: spin }],
      shadowColor: color || C.blue, shadowRadius: 6, shadowOpacity: 0.5,
    }} />
  );
}

function ArcReactor({ onPress, listening }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: listening ? 1.15 : 1.04, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.96, duration: 700, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.2, duration: 900, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(ring, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
  }, [listening]);
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });
  return (
    <TouchableOpacity onPress={() => { haptic(); onPress(); }} activeOpacity={0.8}>
      <View style={{ alignItems: "center", justifyContent: "center", width: 100, height: 100 }}>
        <Animated.View style={{
          position: "absolute", width: 90, height: 90, borderRadius: 45,
          borderWidth: 2, borderColor: listening ? C.green : C.blue,
          transform: [{ scale: ringScale }], opacity: ringOpacity,
        }} />
        <Animated.View style={{
          width: 90, height: 90, borderRadius: 45, backgroundColor: C.bg,
          borderWidth: 2, borderColor: listening ? C.green : C.blue,
          alignItems: "center", justifyContent: "center",
          transform: [{ scale: pulse }],
          shadowColor: listening ? C.green : C.blue,
          shadowRadius: 20, shadowOpacity: 1, elevation: 20,
        }}>
          <Animated.View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: (listening ? C.green : C.blue) + "22",
            alignItems: "center", justifyContent: "center", opacity: glow,
          }}>
            <Text style={{ fontSize: 28 }}>{listening ? "🔴" : "⚡"}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

function NewsTicker({ news }) {
  const x = useRef(new Animated.Value(width)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(x, {
      toValue: -width * 3, duration: 20000, useNativeDriver: true
    })).start();
  }, [news]);
  return (
    <View style={styles.ticker}>
      <Text style={styles.tickerLabel}>📡</Text>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.Text style={[styles.tickerText, { transform: [{ translateX: x }] }]}>
          {news.join("   ◆   ")}
        </Animated.Text>
      </View>
    </View>
  );
}

// ===== ACTION MODAL =====
function ActionModal({ visible, steps, result, onClose }) {
  const slideY = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(slideY, {
      toValue: visible ? 0 : height,
      useNativeDriver: true, tension: 50
    }).start();
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.actionModal, { transform: [{ translateY: slideY }] }]}>
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>⚡ EXECUTING</Text>
          <TouchableOpacity onPress={() => { haptic(); onClose(); }}>
            <Text style={{ color: C.red, fontFamily: "monospace", fontSize: 11 }}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hudLine} />
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {steps.map((s, i) => (
            <View key={i} style={styles.actionStep}>
              <View style={[styles.stepDot, {
                backgroundColor: s.done ? C.green : s.active ? C.blue : C.dim
              }]} />
              <Text style={[styles.stepText, {
                color: s.done ? C.green : s.active ? C.blue : C.dim
              }]}>{s.icon} {s.text}</Text>
              {s.done && <Text style={{ color: C.green }}>✓</Text>}
            </View>
          ))}
          {result ? (
            <View style={styles.actionResult}>
              <Text style={styles.resultLabel}>◆ RESULT</Text>
              <TypewriterText text={result} style={styles.resultText} speed={15} />
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ===== HUD SCREEN =====
function HUDScreen({ onChat, sysInfo, weather, news }) {
  const bat = sysInfo?.battery?.percentage || 0;
  const ram = sysInfo?.ram?.percentage || 0;
  const time = sysInfo?.time || "--:--";

  return (
    <View style={styles.screen}>
      {/* Corner brackets */}
      <View style={styles.cornerTL} /><View style={styles.cornerTR} />

      <View style={styles.hudHeader}>
        <GlitchText text="J.A.R.V.I.S" style={styles.hudTitle} />
        <Text style={styles.hudSub}>JUST A RATHER VERY INTELLIGENT SYSTEM</Text>
        <View style={styles.hudLine} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>BATTERY</Text>
          <Text style={[styles.statVal, { color: bat < 20 ? C.red : C.green }]}>{bat}%</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>RAM</Text>
          <Text style={[styles.statVal, { color: ram > 80 ? C.red : C.orange }]}>{ram}%</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>TEMP</Text>
          <Text style={[styles.statVal, { color: (sysInfo?.battery?.temperature || 0) > 40 ? C.red : C.blue }]}>
            {sysInfo?.battery?.temperature || "--"}°
          </Text>
        </View>
      </View>

      {/* Rings + Reactor */}
      <View style={styles.reactorWrap}>
        <Ring size={200} color={C.blue + "22"} speed={12000} />
        <Ring size={165} color={C.blue + "44"} speed={9000} reverse />
        <Ring size={130} color={C.green + "44"} speed={6000} />
        <Ring size={100} color={C.blue + "77"} speed={3500} reverse />
        <Ring size={72} color={C.blue} speed={2000} />
        <ArcReactor onPress={onChat} />
      </View>

      {/* Weather + Time */}
      <View style={{ paddingHorizontal: 12, gap: 6 }}>
        <View style={styles.weatherCard}>
          <Text style={{ fontSize: 20 }}>🌤️</Text>
          <View>
            <Text style={styles.weatherLabel}>KUWAIT WEATHER</Text>
            <Text style={styles.weatherVal}>{weather || "Loading..."}</Text>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.timeText}>{time.split(' - ')[0]}</Text>
          <Text style={styles.timeSub}>KUWAIT CITY • AST +3</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 4 }}>
        <Text style={styles.footerText}>[ TAP ⚡ TO ACTIVATE ]</Text>
      </View>

      <NewsTicker news={news} />
      <View style={styles.cornerBL} /><View style={styles.cornerBR} />
    </View>
  );
}

// ===== CHAT SCREEN =====
const QUICK_CMDS = ["Battery status", "Kuwait weather", "Latest news", "Search Elon Musk", "Mera RAM kitna hai"];

function ChatScreen({ messages, input, setInput, onSend, loading }) {
  const scrollRef = useRef();
  return (
    <KeyboardAvoidingView style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>⚡ JARVIS CHAT</Text>
        <View style={styles.hudLine} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar}>
        {QUICK_CMDS.map((cmd, i) => (
          <TouchableOpacity key={i} style={styles.quickChip}
            onPress={() => { haptic(); setInput(cmd); }}>
            <Text style={styles.quickText}>{cmd}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView ref={scrollRef} style={{ flex: 1 }}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgWrap, m.role === "user" ? styles.msgRight : styles.msgLeft]}>
            {m.role === "jarvis" && <Text style={styles.msgSender}>⚡ JARVIS</Text>}
            <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleJarvis]}>
              {m.role === "jarvis"
                ? <TypewriterText text={m.text} style={styles.msgText} speed={10} />
                : <Text style={styles.msgText}>{m.text}</Text>}
            </View>
            <Text style={styles.msgTime}>{m.time}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.msgLeft}>
            <View style={styles.bubbleJarvis}>
              <Text style={{ color: C.blue, fontFamily: "monospace", fontSize: 11 }}>PROCESSING ●●●</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput style={styles.input} value={input} onChangeText={setInput}
          placeholder="Enter command..." placeholderTextColor={C.dim}
          onSubmitEditing={onSend} multiline returnKeyType="send" />
        <TouchableOpacity style={styles.sendBtn} onPress={() => { haptic(); onSend(); }}>
          <Text style={{ color: C.bg, fontSize: 16, fontWeight: "bold" }}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ===== DASHBOARD =====
function DashboardScreen({ sysInfo, weather, memories, skills }) {
  const bat = sysInfo?.battery?.percentage || 0;
  const ram = sysInfo?.ram?.percentage || 0;
  const storage = sysInfo?.storage || "--";

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>📊 SYSTEM DASHBOARD</Text>
        <View style={styles.hudLine} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { icon: "🔋", label: "BATTERY", value: `${bat}%`, color: bat < 20 ? C.red : C.green },
            { icon: "💾", label: "RAM", value: `${ram}%`, color: ram > 80 ? C.red : C.orange },
            { icon: "📦", label: "STORAGE", value: storage, color: C.blue },
            { icon: "🌡️", label: "TEMP", value: `${sysInfo?.battery?.temperature || "--"}°C`, color: C.orange },
            { icon: "🌤️", label: "WEATHER", value: weather || "--", color: C.green },
            { icon: "⚡", label: "STATUS", value: "ONLINE", color: C.green },
            { icon: "🧠", label: "AI MODEL", value: "LLAMA 70B", color: C.blue },
            { icon: "🎯", label: "SKILLS", value: `${skills}+`, color: C.purple },
          ].map((s, i) => (
            <View key={i} style={[styles.dashCard, { width: (width - 40) / 2 }]}>
              <Text style={{ fontSize: 20 }}>{s.icon}</Text>
              <Text style={{ color: s.color, fontSize: 8, letterSpacing: 2, marginTop: 3 }}>{s.label}</Text>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" }}>
                {s.value}
              </Text>
              <View style={[styles.dashDot, { backgroundColor: s.color }]} />
            </View>
          ))}
        </View>

        {/* Recent Memories */}
        <View style={styles.memCard}>
          <Text style={styles.memTitle}>🧠 RECENT MEMORY</Text>
          {memories.slice(0, 3).map((m, i) => (
            <Text key={i} style={styles.memItem}>◆ {m.replace(/\[.*?\]\s*/, '').slice(0, 50)}</Text>
          ))}
        </View>

        {/* Time */}
        <View style={[styles.memCard, { alignItems: "center" }]}>
          <Text style={styles.memTitle}>🕐 KUWAIT TIME</Text>
          <Text style={{ color: C.blue, fontSize: 20, fontFamily: "monospace", fontWeight: "bold" }}>
            {sysInfo?.time?.split(' - ')[0] || "--:--"}
          </Text>
          <Text style={{ color: C.dim, fontSize: 10, fontFamily: "monospace" }}>
            {sysInfo?.time?.split(' - ')[1] || ""}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ===== MAIN =====
export default function App() {
  const [screen, setScreen] = useState(0);
  const [messages, setMessages] = useState([
    { role: "jarvis", text: "JARVIS ONLINE. All systems operational. Awaiting your command, Faizan.", time: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sysInfo, setSysInfo] = useState(null);
  const [weather, setWeather] = useState("");
  const [news, setNews] = useState(["JARVIS SYSTEM ONLINE", "ALL SYSTEMS OPERATIONAL"]);
  const [memories, setMemories] = useState([]);
  const [skills, setSkills] = useState(40);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionSteps, setActionSteps] = useState([]);
  const [actionResult, setActionResult] = useState("");

  const loadData = async () => {
    const sys = await api.get("/system");
    if (sys) setSysInfo(sys);

    const w = await api.get("/weather?city=Kuwait");
    if (w) setWeather(w.weather);

    const n = await api.get("/news?topic=world");
    if (n?.news) setNews(n.news.slice(0, 4));

    const m = await api.get("/memory/list");
    if (m?.memories) setMemories(m.memories);

    const s = await api.get("/skills");
    if (s?.count) setSkills(s.count);
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 40,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -50) { haptic(); setScreen(s => Math.min(s + 1, 2)); }
      if (g.dx > 50) { haptic(); setScreen(s => Math.max(s - 1, 0)); }
    },
  })).current;

  const sendMsg = async () => {
    const text = input.trim();
    if (!text) return;
    haptic();
    const t = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setInput("");
    setMessages(p => [...p, { role: "user", text, time: t }]);
    setLoading(true);

    const isSearch = /search|find|google|kya hai|who is|batao|news|weather/i.test(text);

    if (isSearch) {
      setActionSteps([
        { icon: "🧠", text: "Analyzing command...", done: false, active: true },
        { icon: "🔍", text: "Searching web...", done: false, active: false },
        { icon: "📊", text: "Processing results...", done: false, active: false },
        { icon: "✅", text: "Preparing answer...", done: false, active: false },
      ]);
      setActionResult("");
      setActionVisible(true);
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 0 ? { ...st, done: true, active: false } : i === 1 ? { ...st, active: true } : st)), 600);
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 1 ? { ...st, done: true, active: false } : i === 2 ? { ...st, active: true } : st)), 1400);
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 2 ? { ...st, done: true, active: false } : i === 3 ? { ...st, active: true } : st)), 2000);
    }

    let response;
    if (isSearch) {
      const data = await api.post("/ask/search", { message: text });
      response = data?.response || "Search failed";
    } else {
      const data = await api.post("/ask", { message: text });
      response = data?.response || "Error connecting to Jarvis server";
    }

    setMessages(p => [...p, { role: "jarvis", text: response, time: t }]);

    if (isSearch) {
      setActionSteps(s => s.map(st => ({ ...st, done: true, active: false })));
      setActionResult(response);
    }

    setLoading(false);
  };

  const [serverIP, setServerIP] = useState(DEFAULT_IP);
  const [showSettings, setShowSettings] = useState(false);

  const updateAPI = (ip) => {
    API = `http://${ip}:8000`;
    setServerIP(ip);
  };

  return (
    <SafeAreaView style={styles.container} {...pan.panHandlers}>
      <StatusBar backgroundColor={C.bg} barStyle="light-content" />

      {screen === 0 && <HUDScreen onChat={() => { haptic(); setScreen(1); }}
        sysInfo={sysInfo} weather={weather} news={news} />}
      {screen === 1 && <ChatScreen messages={messages} input={input}
        setInput={setInput} onSend={sendMsg} loading={loading} />}
      {screen === 2 && <DashboardScreen sysInfo={sysInfo} weather={weather}
        memories={memories} skills={skills} />}

      <ActionModal visible={actionVisible} steps={actionSteps}
        result={actionResult} onClose={() => setActionVisible(false)} />

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={{flex:1, backgroundColor:"#000510EE", justifyContent:"center", padding:20}}>
          <Text style={{color:C.blue, fontFamily:"monospace", fontSize:14, letterSpacing:4, marginBottom:20}}>⚙️ SERVER SETTINGS</Text>
          <Text style={{color:C.dim, fontFamily:"monospace", fontSize:11, marginBottom:8}}>TERMUX SERVER IP:</Text>
          <TextInput
            style={[styles.input, {marginBottom:16}]}
            value={serverIP}
            onChangeText={setServerIP}
            placeholder="e.g. 10.139.106.157"
            placeholderTextColor={C.dim}
            keyboardType="numeric"
          />
          <Text style={{color:C.dim, fontFamily:"monospace", fontSize:10, marginBottom:16}}>
            Termux mein run karo: ifconfig | grep inet
          </Text>
          <TouchableOpacity style={[styles.sendBtn, {width:"100%", borderRadius:8, height:46}]}
            onPress={() => { updateAPI(serverIP); setShowSettings(false); loadData(); }}>
            <Text style={{color:C.bg, fontFamily:"monospace", fontWeight:"bold"}}>CONNECT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop:12, alignItems:"center"}}
            onPress={() => setShowSettings(false)}>
            <Text style={{color:C.red, fontFamily:"monospace"}}>[ CANCEL ]</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.nav}>
        {[{ l: "HUD", i: "⚡" }, { l: "CHAT", i: "💬" }, { l: "DASH", i: "📊" }, { l: "SET", i: "⚙️" }].map((item, i) => (
          <TouchableOpacity key={i} 
            onPress={() => { 
              haptic(); 
              if(i === 3) setShowSettings(true);
              else setScreen(i); 
            }} 
            style={styles.navBtn}>
            <Text style={{ fontSize: 14 }}>{item.i}</Text>
            <View style={[styles.dot, screen === i && styles.dotActive]} />
            <Text style={[styles.navLabel, screen === i && { color: C.blue }]}>{item.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },
  hudLine: { height: 1, backgroundColor: C.blue + "33", width: "100%", marginTop: 6 },

  cornerTL: { position: "absolute", top: 55, left: 8, width: 16, height: 16, borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.blue + "66" },
  cornerTR: { position: "absolute", top: 55, right: 8, width: 16, height: 16, borderTopWidth: 1, borderRightWidth: 1, borderColor: C.blue + "66" },
  cornerBL: { position: "absolute", bottom: 45, left: 8, width: 16, height: 16, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: C.blue + "66" },
  cornerBR: { position: "absolute", bottom: 45, right: 8, width: 16, height: 16, borderBottomWidth: 1, borderRightWidth: 1, borderColor: C.blue + "66" },

  hudHeader: { alignItems: "center", paddingTop: 8, paddingHorizontal: 14 },
  hudTitle: { color: C.blue, fontSize: 22, fontWeight: "900", letterSpacing: 8, fontFamily: "monospace", textShadowColor: C.blue, textShadowRadius: 12 },
  hudSub: { color: C.blue + "44", fontSize: 6, letterSpacing: 3, marginTop: 2, fontFamily: "monospace" },

  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 10, paddingVertical: 5 },
  statChip: { alignItems: "center", backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "33", borderRadius: 6, padding: 6, minWidth: 88 },
  statLabel: { color: C.blue + "66", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
  statVal: { fontSize: 14, fontWeight: "bold", fontFamily: "monospace" },

  reactorWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  weatherCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.green + "33", borderRadius: 8, padding: 8 },
  weatherLabel: { color: C.green + "66", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
  weatherVal: { color: C.green, fontSize: 12, fontFamily: "monospace" },
  timeText: { color: C.blue, fontSize: 20, fontFamily: "monospace", fontWeight: "bold", letterSpacing: 3 },
  timeSub: { color: C.blue + "44", fontSize: 7, letterSpacing: 3, fontFamily: "monospace" },
  footerText: { color: C.blue + "66", fontSize: 9, letterSpacing: 4, fontFamily: "monospace" },

  ticker: { flexDirection: "row", alignItems: "center", backgroundColor: C.blue + "0D", paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.blue + "22", overflow: "hidden" },
  tickerLabel: { fontSize: 12, marginRight: 6 },
  tickerText: { color: C.blue + "77", fontSize: 9, fontFamily: "monospace", letterSpacing: 1, width: width * 4 },

  chatHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: C.blue + "22" },
  chatTitle: { color: C.blue, fontSize: 13, fontWeight: "bold", letterSpacing: 4, fontFamily: "monospace" },

  quickBar: { maxHeight: 38, paddingHorizontal: 8, paddingVertical: 3 },
  quickChip: { backgroundColor: C.blue + "15", borderWidth: 1, borderColor: C.blue + "44", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  quickText: { color: C.blue, fontSize: 10, fontFamily: "monospace" },

  msgWrap: { marginVertical: 3 },
  msgLeft: { alignItems: "flex-start" },
  msgRight: { alignItems: "flex-end" },
  msgSender: { color: C.blue, fontSize: 7, letterSpacing: 2, marginBottom: 2, fontFamily: "monospace" },
  bubble: { maxWidth: "82%", padding: 10, borderRadius: 6 },
  bubbleJarvis: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "33", borderTopLeftRadius: 0 },
  bubbleUser: { backgroundColor: C.blue + "1A", borderWidth: 1, borderColor: C.blue + "55", borderTopRightRadius: 0 },
  msgText: { color: C.text, fontSize: 13, fontFamily: "monospace", lineHeight: 19 },
  msgTime: { color: C.blue + "33", fontSize: 7, marginTop: 2, fontFamily: "monospace" },

  inputArea: { flexDirection: "row", padding: 8, gap: 6, borderTopWidth: 1, borderTopColor: C.blue + "22", backgroundColor: C.card, alignItems: "flex-end" },
  input: { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.blue + "44", borderRadius: 4, padding: 8, color: C.text, fontFamily: "monospace", fontSize: 13, maxHeight: 80 },
  sendBtn: { backgroundColor: C.blue, width: 42, height: 42, borderRadius: 4, alignItems: "center", justifyContent: "center" },

  dashCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "22", borderRadius: 8, padding: 10, position: "relative" },
  dashDot: { position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },

  memCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "22", borderRadius: 8, padding: 12 },
  memTitle: { color: C.blue, fontSize: 9, letterSpacing: 3, fontFamily: "monospace", marginBottom: 8 },
  memItem: { color: C.text, fontSize: 11, fontFamily: "monospace", marginBottom: 4, opacity: 0.8 },

  actionModal: { position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.7, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.blue + "44", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  actionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  actionTitle: { color: C.blue, fontSize: 12, fontWeight: "bold", letterSpacing: 4, fontFamily: "monospace" },
  actionStep: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepText: { fontFamily: "monospace", fontSize: 13, flex: 1 },
  actionResult: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.green + "44", borderRadius: 8, padding: 12, marginTop: 8 },
  resultLabel: { color: C.green, fontSize: 8, letterSpacing: 3, fontFamily: "monospace", marginBottom: 6 },
  resultText: { color: C.text, fontSize: 13, fontFamily: "monospace", lineHeight: 20 },

  nav: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 6, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.blue + "22" },
  navBtn: { alignItems: "center", gap: 2, paddingHorizontal: 20 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.blue + "33" },
  dotActive: { backgroundColor: C.blue, width: 16 },
  navLabel: { color: C.blue + "44", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
});
