import { useState, useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, SafeAreaView, Animated, Dimensions,
  PanResponder
} from "react-native";

const { width, height } = Dimensions.get("window");
const API = "http://10.148.123.146:8000";

// Colors
const C = {
  bg: "#000510",
  blue: "#00D4FF",
  green: "#00FF88",
  orange: "#FF6B00",
  dim: "#003344",
  card: "#000D1A",
  text: "#CCF5FF",
};

// ===== COMPONENTS =====

// Glowing Ring
function Ring({ size, color, speed, delay }) {
  const rot = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1, duration: speed || 4000,
        delay: delay || 0,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 1,
      borderColor: color || C.blue,
      borderStyle: "dashed",
      transform: [{ rotate: spin }, { scale: pulse }],
      shadowColor: color || C.blue,
      shadowRadius: 10,
      shadowOpacity: 0.8,
      elevation: 10,
    }} />
  );
}

// Scan Line
function ScanLine() {
  const y = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(y, {
        toValue: height, duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute", left: 0, right: 0,
      height: 2,
      background: "transparent",
      borderTopWidth: 1,
      borderTopColor: C.blue + "44",
      transform: [{ translateY: y }],
      zIndex: 0,
    }} />
  );
}

// Arc Reactor Center
function ArcReactor({ onPress, listening }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: listening ? 1.2 : 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [listening]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={{
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: C.bg,
        borderWidth: 2,
        borderColor: listening ? C.green : C.blue,
        alignItems: "center", justifyContent: "center",
        transform: [{ scale: pulse }],
        shadowColor: listening ? C.green : C.blue,
        shadowRadius: 20, shadowOpacity: 1, elevation: 20,
      }}>
        <Animated.View style={{
          width: 60, height: 60, borderRadius: 30,
          backgroundColor: listening ? C.green + "33" : C.blue + "33",
          alignItems: "center", justifyContent: "center",
          opacity: glow,
        }}>
          <Text style={{ fontSize: 30 }}>{listening ? "🔴" : "⚡"}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// HUD Text
function HudText({ label, value, color }) {
  return (
    <View style={{ alignItems: "center", minWidth: 80 }}>
      <Text style={{ color: color || C.blue, fontSize: 9, letterSpacing: 2, opacity: 0.7 }}>
        {label}
      </Text>
      <Text style={{ color: color || C.blue, fontSize: 14, fontFamily: "monospace", fontWeight: "bold" }}>
        {value}
      </Text>
    </View>
  );
}

// ===== SCREENS =====

// Screen 1: HUD Main
function HUDScreen({ onChat, battery, time }) {
  return (
    <View style={styles.screen}>
      <ScanLine />

      {/* Grid */}
      <View style={styles.grid} />

      {/* Header */}
      <View style={styles.hudHeader}>
        <Text style={styles.hudTitle}>J.A.R.V.I.S</Text>
        <Text style={styles.hudSub}>JUST A RATHER VERY INTELLIGENT SYSTEM</Text>
        <View style={styles.hudLine} />
      </View>

      {/* Rings + Arc Reactor */}
      <View style={styles.reactorWrap}>
        <Ring size={280} color={C.blue + "33"} speed={12000} />
        <Ring size={220} color={C.blue + "66"} speed={8000} delay={500} />
        <Ring size={160} color={C.green + "66"} speed={5000} delay={1000} />
        <Ring size={120} color={C.blue} speed={3000} delay={200} />
        <ArcReactor onPress={onChat} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <HudText label="BATTERY" value={battery} color={C.green} />
        <HudText label="STATUS" value="ONLINE" color={C.blue} />
        <HudText label="TIME" value={time} color={C.orange} />
      </View>

      {/* Bottom */}
      <View style={styles.hudFooter}>
        <Text style={styles.footerText}>[ TAP TO ACTIVATE ]</Text>
        <Text style={styles.footerSub}>SWIPE LEFT FOR CHAT • RIGHT FOR DASHBOARD</Text>
      </View>
    </View>
  );
}

// Screen 2: Chat
function ChatScreen({ messages, input, setInput, onSend, loading }) {
  const scrollRef = useRef();
  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>⚡ JARVIS CHAT</Text>
        <View style={[styles.hudLine, { marginTop: 4 }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        {messages.map((m, i) => (
          <View key={i} style={[
            styles.msgWrap,
            m.role === "user" ? styles.msgRight : styles.msgLeft
          ]}>
            {m.role === "jarvis" && (
              <Text style={styles.msgSender}>⚡ JARVIS</Text>
            )}
            <View style={[
              styles.bubble,
              m.role === "user" ? styles.bubbleUser : styles.bubbleJarvis
            ]}>
              <Text style={styles.msgText}>{m.text}</Text>
            </View>
            <Text style={styles.msgTime}>{m.time}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.msgLeft}>
            <Text style={{ color: C.blue, fontFamily: "monospace" }}>PROCESSING...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Enter command..."
          placeholderTextColor={C.dim}
          onSubmitEditing={onSend}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={{ color: C.bg, fontSize: 18, fontWeight: "bold" }}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Screen 3: Dashboard
function DashboardScreen({ battery, time }) {
  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>📊 SYSTEM DASHBOARD</Text>
        <View style={[styles.hudLine, { marginTop: 4 }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {[
          { label: "BATTERY", value: battery, color: C.green, icon: "🔋" },
          { label: "KUWAIT TIME", value: time, color: C.blue, icon: "🕐" },
          { label: "AI MODEL", value: "LLAMA 3.3 70B", color: C.orange, icon: "🧠" },
          { label: "STATUS", value: "ONLINE", color: C.green, icon: "⚡" },
          { label: "SKILLS", value: "40+ ACTIVE", color: C.blue, icon: "🎯" },
        ].map((item, i) => (
          <View key={i} style={styles.dashCard}>
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: item.color, fontSize: 10, letterSpacing: 2 }}>{item.label}</Text>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", fontFamily: "monospace" }}>
                {item.value}
              </Text>
            </View>
            <View style={[styles.dashDot, { backgroundColor: item.color }]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [screen, setScreen] = useState(0); // 0=HUD, 1=Chat, 2=Dashboard
  const [messages, setMessages] = useState([
    { role: "jarvis", text: "JARVIS ONLINE. Awaiting your command, Faizan.", time: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState("--");
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
        timeZone: "Asia/Kuwait"
      }));
    }, 1000);

    fetch(`${API}/battery`)
      .then(r => r.json())
      .then(d => {
        try { const b = JSON.parse(d.data); setBattery(`${b.percentage}%`); }
        catch { setBattery("--"); }
      }).catch(() => {});

    return () => clearInterval(timer);
  }, []);

  // Swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) setScreen(s => Math.min(s + 1, 2));
        if (g.dx > 50) setScreen(s => Math.max(s - 1, 0));
      },
    })
  ).current;

  const sendMsg = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    const t = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setInput("");
    setMessages(p => [...p, { role: "user", text: msg, time: t }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "jarvis", text: data.response, time: t }]);
    } catch {
      setMessages(p => [...p, { role: "jarvis", text: "CONNECTION ERROR. Check Termux server.", time: t }]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <StatusBar backgroundColor={C.bg} barStyle="light-content" />

      {screen === 0 && (
        <HUDScreen onChat={() => setScreen(1)} battery={battery} time={time} />
      )}
      {screen === 1 && (
        <ChatScreen messages={messages} input={input} setInput={setInput} onSend={sendMsg} loading={loading} />
      )}
      {screen === 2 && (
        <DashboardScreen battery={battery} time={time} />
      )}

      {/* Nav dots */}
      <View style={styles.navDots}>
        {[0, 1, 2].map(i => (
          <TouchableOpacity key={i} onPress={() => setScreen(i)}>
            <View style={[styles.dot, screen === i && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },

  // Grid background
  grid: {
    position: "absolute", inset: 0,
    opacity: 0.05,
    backgroundColor: "transparent",
  },

  // HUD
  hudHeader: { alignItems: "center", paddingTop: 20, paddingHorizontal: 20 },
  hudTitle: {
    color: C.blue, fontSize: 28, fontWeight: "900",
    letterSpacing: 12, fontFamily: "monospace",
    textShadowColor: C.blue, textShadowRadius: 20,
  },
  hudSub: {
    color: C.blue + "66", fontSize: 8,
    letterSpacing: 3, marginTop: 4, fontFamily: "monospace",
  },
  hudLine: {
    height: 1, backgroundColor: C.blue + "44",
    width: "100%", marginTop: 12,
  },

  reactorWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: C.blue + "22",
  },

  hudFooter: { alignItems: "center", paddingBottom: 16 },
  footerText: {
    color: C.blue, fontSize: 11, letterSpacing: 4,
    fontFamily: "monospace",
  },
  footerSub: {
    color: C.blue + "44", fontSize: 8,
    letterSpacing: 2, marginTop: 4, fontFamily: "monospace",
  },

  // Chat
  chatHeader: {
    padding: 16, borderBottomWidth: 1,
    borderBottomColor: C.blue + "33",
  },
  chatTitle: {
    color: C.blue, fontSize: 16, fontWeight: "bold",
    letterSpacing: 4, fontFamily: "monospace",
  },

  msgWrap: { marginVertical: 4 },
  msgLeft: { alignItems: "flex-start" },
  msgRight: { alignItems: "flex-end" },
  msgSender: { color: C.blue, fontSize: 9, letterSpacing: 2, marginBottom: 2 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 4 },
  bubbleJarvis: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.blue + "44",
    borderTopLeftRadius: 0,
  },
  bubbleUser: {
    backgroundColor: C.blue + "22",
    borderWidth: 1, borderColor: C.blue + "66",
    borderTopRightRadius: 0,
  },
  msgText: { color: C.text, fontSize: 14, fontFamily: "monospace", lineHeight: 20 },
  msgTime: { color: C.blue + "44", fontSize: 9, marginTop: 2, fontFamily: "monospace" },

  // Input
  inputArea: {
    flexDirection: "row", padding: 8, gap: 8,
    borderTopWidth: 1, borderTopColor: C.blue + "33",
    backgroundColor: C.card,
  },
  input: {
    flex: 1, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.blue + "44",
    borderRadius: 4, padding: 10,
    color: C.text, fontFamily: "monospace", fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: C.blue, width: 46, height: 46,
    borderRadius: 4, alignItems: "center", justifyContent: "center",
  },

  // Dashboard
  dashCard: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.blue + "33",
    borderRadius: 8, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  dashDot: { width: 8, height: 8, borderRadius: 4 },

  // Nav
  navDots: {
    flexDirection: "row", justifyContent: "center",
    gap: 8, paddingVertical: 10,
    backgroundColor: C.bg,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.blue + "33" },
  dotActive: { backgroundColor: C.blue, width: 20 },
});
