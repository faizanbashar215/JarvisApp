import { useState, useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, SafeAreaView, Animated, Dimensions,
  PanResponder, Platform
} from "react-native";

const { width, height } = Dimensions.get("window");
const API = "http://10.148.123.146:8000";

const C = {
  bg: "#000510",
  blue: "#00D4FF",
  green: "#00FF88",
  orange: "#FF6B00",
  red: "#FF3366",
  dim: "#003344",
  card: "#000D1A",
  text: "#CCF5FF",
};

// ===== PARTICLE SYSTEM =====
function Particles() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(Math.random()),
      size: Math.random() * 3 + 1,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const animate = () => {
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: -10,
            duration: 3000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
              Animated.timing(p.opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
        ]).start(() => {
          p.x.setValue(Math.random() * width);
          p.y.setValue(height + 10);
          p.opacity.setValue(0);
          animate();
        });
      };
      setTimeout(animate, Math.random() * 3000);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View key={i} style={{
          position: "absolute",
          width: p.size, height: p.size,
          borderRadius: p.size / 2,
          backgroundColor: i % 3 === 0 ? C.blue : i % 3 === 1 ? C.green : C.orange,
          opacity: p.opacity,
          transform: [{ translateX: p.x }, { translateY: p.y }],
          shadowColor: C.blue,
          shadowRadius: 4,
          shadowOpacity: 1,
        }} />
      ))}
    </View>
  );
}

// ===== RING =====
function Ring({ size, color, speed, delay, reverse }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1, duration: speed || 4000,
        delay: delay || 0, useNativeDriver: true,
      })
    ).start();
  }, []);
  const spin = rot.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ["360deg", "0deg"] : ["0deg", "360deg"],
  });
  return (
    <Animated.View style={{
      position: "absolute",
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1, borderColor: color || C.blue,
      borderStyle: "dashed",
      transform: [{ rotate: spin }],
      shadowColor: color || C.blue,
      shadowRadius: 8, shadowOpacity: 0.6, elevation: 8,
    }} />
  );
}

// ===== ARC REACTOR =====
function ArcReactor({ onPress, listening }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: listening ? 1.15 : 1.05, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.95, duration: 600, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.2, duration: 800, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(ring, {
      toValue: 1, duration: 2000, useNativeDriver: true,
    })).start();
  }, [listening]);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{ alignItems: "center", justifyContent: "center", width: 120, height: 120 }}>
        {/* Ripple */}
        <Animated.View style={{
          position: "absolute", width: 100, height: 100, borderRadius: 50,
          borderWidth: 2, borderColor: listening ? C.green : C.blue,
          transform: [{ scale: ringScale }], opacity: ringOpacity,
        }} />
        <Animated.View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: C.bg,
          borderWidth: 2, borderColor: listening ? C.green : C.blue,
          alignItems: "center", justifyContent: "center",
          transform: [{ scale: pulse }],
          shadowColor: listening ? C.green : C.blue,
          shadowRadius: 25, shadowOpacity: 1, elevation: 25,
        }}>
          <Animated.View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: (listening ? C.green : C.blue) + "22",
            alignItems: "center", justifyContent: "center",
            opacity: glow,
          }}>
            <Text style={{ fontSize: 32 }}>{listening ? "🔴" : "⚡"}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// ===== NEWS TICKER =====
function NewsTicker({ news }) {
  const x = useRef(new Animated.Value(width)).current;
  useEffect(() => {
    if (!news.length) return;
    Animated.loop(
      Animated.timing(x, {
        toValue: -width * 2, duration: 15000, useNativeDriver: true,
      })
    ).start();
  }, [news]);

  return (
    <View style={styles.ticker}>
      <Text style={styles.tickerLabel}>📰</Text>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.Text style={[styles.tickerText, { transform: [{ translateX: x }] }]}>
          {news.join("   ◆   ")}
        </Animated.Text>
      </View>
    </View>
  );
}

// ===== WEATHER WIDGET =====
function WeatherWidget({ weather }) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherIcon}>🌤️</Text>
      <View>
        <Text style={styles.weatherLabel}>KUWAIT WEATHER</Text>
        <Text style={styles.weatherValue}>{weather || "Fetching..."}</Text>
      </View>
    </View>
  );
}

// ===== VOICE BUTTON =====
function VoiceBtn({ onPress, active }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])).start();
    } else {
      scale.setValue(1);
    }
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[styles.voiceBtn, {
        backgroundColor: active ? C.red + "33" : C.green + "22",
        borderColor: active ? C.red : C.green,
        transform: [{ scale }],
      }]}>
        <Text style={{ fontSize: 20 }}>{active ? "🔴" : "🎤"}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ===== HUD SCREEN =====
function HUDScreen({ onChat, battery, time, weather, news, ram, network }) {
  return (
    <View style={styles.screen}>
      <Particles />

      {/* Header */}
      <View style={styles.hudHeader}>
        <Text style={styles.hudTitle}>J.A.R.V.I.S</Text>
        <Text style={styles.hudSub}>JUST A RATHER VERY INTELLIGENT SYSTEM</Text>
        <View style={styles.hudLine} />
      </View>

      {/* Stats Row Top */}
      <View style={styles.statsRowTop}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>BATTERY</Text>
          <Text style={styles.statChipVal}>{battery}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>RAM</Text>
          <Text style={styles.statChipVal}>{ram}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>NET</Text>
          <Text style={styles.statChipVal}>{network}</Text>
        </View>
      </View>

      {/* Rings */}
      <View style={styles.reactorWrap}>
        <Ring size={260} color={C.blue + "22"} speed={15000} />
        <Ring size={210} color={C.blue + "44"} speed={10000} delay={300} reverse />
        <Ring size={160} color={C.green + "55"} speed={7000} delay={600} />
        <Ring size={120} color={C.blue + "88"} speed={4000} delay={100} reverse />
        <Ring size={85} color={C.blue} speed={2500} />
        <ArcReactor onPress={onChat} />
      </View>

      {/* Weather */}
      <WeatherWidget weather={weather} />

      {/* Time */}
      <View style={styles.timeWrap}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.timeSub}>KUWAIT CITY • AST +3</Text>
      </View>

      {/* Footer */}
      <View style={styles.hudFooter}>
        <Text style={styles.footerText}>[ TAP ⚡ TO CHAT ]</Text>
        <Text style={styles.footerSub}>← SWIPE → TO NAVIGATE</Text>
      </View>

      {/* News Ticker */}
      <NewsTicker news={news} />
    </View>
  );
}

// ===== CHAT SCREEN =====
function ChatScreen({ messages, input, setInput, onSend, loading, voiceActive, onVoice }) {
  const scrollRef = useRef();
  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>⚡ JARVIS CHAT</Text>
        <View style={styles.hudLine} />
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgWrap, m.role === "user" ? styles.msgRight : styles.msgLeft]}>
            {m.role === "jarvis" && <Text style={styles.msgSender}>⚡ JARVIS</Text>}
            <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleJarvis]}>
              <Text style={styles.msgText}>{m.text}</Text>
            </View>
            <Text style={styles.msgTime}>{m.time}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.msgLeft}>
            <View style={styles.bubbleJarvis}>
              <Text style={{ color: C.blue, fontFamily: "monospace" }}>PROCESSING...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <VoiceBtn onPress={onVoice} active={voiceActive} />
        <TextInput style={styles.input} value={input} onChangeText={setInput}
          placeholder="Enter command..." placeholderTextColor={C.dim}
          onSubmitEditing={onSend} multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={{ color: C.bg, fontSize: 18, fontWeight: "bold" }}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== DASHBOARD SCREEN =====
function DashboardScreen({ battery, time, ram, network, weather }) {
  const stats = [
    { label: "BATTERY", value: battery, color: C.green, icon: "🔋" },
    { label: "KUWAIT TIME", value: time, color: C.blue, icon: "🕐" },
    { label: "RAM", value: ram, color: C.orange, icon: "💾" },
    { label: "NETWORK", value: network, color: C.blue, icon: "📶" },
    { label: "WEATHER", value: weather, color: C.green, icon: "🌤️" },
    { label: "AI MODEL", value: "LLAMA 3.3 70B", color: C.orange, icon: "🧠" },
    { label: "STATUS", value: "ONLINE", color: C.green, icon: "⚡" },
    { label: "SKILLS", value: "40+ ACTIVE", color: C.blue, icon: "🎯" },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>📊 SYSTEM DASHBOARD</Text>
        <View style={styles.hudLine} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.dashCard, { width: (width - 40) / 2 }]}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</Text>
              <Text style={{ color: s.color, fontSize: 9, letterSpacing: 2 }}>{s.label}</Text>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold", fontFamily: "monospace" }}>
                {s.value || "--"}
              </Text>
              <View style={[styles.dashDot, { backgroundColor: s.color }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ===== MAIN =====
export default function App() {
  const [screen, setScreen] = useState(0);
  const [messages, setMessages] = useState([
    { role: "jarvis", text: "JARVIS ONLINE. Awaiting your command, Faizan.", time: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [battery, setBattery] = useState("--");
  const [ram, setRam] = useState("--");
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState("");
  const [network, setNetwork] = useState("WIFI");
  const [news, setNews] = useState([
    "JARVIS SYSTEM ONLINE",
    "ALL SYSTEMS OPERATIONAL",
    "KUWAIT CITY • AST +3",
  ]);

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Asia/Kuwait"
      }));
    }, 1000);

    // Battery
    fetch(`${API}/battery`)
      .then(r => r.json())
      .then(d => {
        try {
          const b = JSON.parse(d.data);
          setBattery(`${b.percentage}%`);
        } catch {}
      }).catch(() => {});

    // Weather
    fetch(`${API}/search?q=Kuwait+weather+today`)
      .then(r => r.json())
      .then(d => setWeather(d.result?.slice(0, 20) || "Clear"))
      .catch(() => setWeather("Clear ☀️"));

    // News
    fetch(`${API}/search?q=india+news+today`)
      .then(r => r.json())
      .then(d => {
        if (d.result) {
          const lines = d.result.split("\n").filter(l => l.trim()).slice(0, 4);
          setNews(lines.length ? lines : news);
        }
      }).catch(() => {});

    return () => clearInterval(timer);
  }, []);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 30,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -50) setScreen(s => Math.min(s + 1, 2));
      if (g.dx > 50) setScreen(s => Math.max(s - 1, 0));
    },
  })).current;

  const sendMsg = async (msg) => {
    const text = msg || input.trim();
    if (!text) return;
    const t = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setInput("");
    setMessages(p => [...p, { role: "user", text, time: t }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "jarvis", text: data.response, time: t }]);
    } catch {
      setMessages(p => [...p, {
        role: "jarvis",
        text: "CONNECTION ERROR. Start Termux server: uvicorn api:app --host 0.0.0.0 --port 8000",
        time: t
      }]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} {...pan.panHandlers}>
      <StatusBar backgroundColor={C.bg} barStyle="light-content" />

      {screen === 0 && <HUDScreen onChat={() => setScreen(1)}
        battery={battery} time={time} weather={weather}
        news={news} ram={ram} network={network} />}
      {screen === 1 && <ChatScreen messages={messages} input={input}
        setInput={setInput} onSend={() => sendMsg()} loading={loading}
        voiceActive={voiceActive} onVoice={() => setVoiceActive(v => !v)} />}
      {screen === 2 && <DashboardScreen battery={battery} time={time}
        ram={ram} network={network} weather={weather} />}

      {/* Nav */}
      <View style={styles.navDots}>
        {["HUD", "CHAT", "DASH"].map((label, i) => (
          <TouchableOpacity key={i} onPress={() => setScreen(i)} style={styles.navBtn}>
            <View style={[styles.dot, screen === i && styles.dotActive]} />
            <Text style={[styles.navLabel, screen === i && { color: C.blue }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },

  hudHeader: { alignItems: "center", paddingTop: 16, paddingHorizontal: 20 },
  hudTitle: {
    color: C.blue, fontSize: 26, fontWeight: "900",
    letterSpacing: 10, fontFamily: "monospace",
    textShadowColor: C.blue, textShadowRadius: 15,
  },
  hudSub: { color: C.blue + "55", fontSize: 7, letterSpacing: 3, marginTop: 3, fontFamily: "monospace" },
  hudLine: { height: 1, backgroundColor: C.blue + "33", width: "100%", marginTop: 10 },

  statsRowTop: {
    flexDirection: "row", justifyContent: "space-around",
    paddingHorizontal: 16, paddingVertical: 8,
  },
  statChip: {
    alignItems: "center", backgroundColor: C.card,
    borderWidth: 1, borderColor: C.blue + "33",
    borderRadius: 6, padding: 6, minWidth: 80,
  },
  statChipLabel: { color: C.blue + "88", fontSize: 8, letterSpacing: 2, fontFamily: "monospace" },
  statChipVal: { color: C.blue, fontSize: 13, fontWeight: "bold", fontFamily: "monospace" },

  reactorWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  weatherCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 20, padding: 10,
    backgroundColor: C.card, borderWidth: 1,
    borderColor: C.green + "33", borderRadius: 8,
  },
  weatherIcon: { fontSize: 24 },
  weatherLabel: { color: C.green + "88", fontSize: 8, letterSpacing: 2, fontFamily: "monospace" },
  weatherValue: { color: C.green, fontSize: 13, fontFamily: "monospace" },

  timeWrap: { alignItems: "center", paddingVertical: 8 },
  timeText: { color: C.blue, fontSize: 22, fontFamily: "monospace", fontWeight: "bold", letterSpacing: 4 },
  timeSub: { color: C.blue + "55", fontSize: 8, letterSpacing: 3, fontFamily: "monospace" },

  hudFooter: { alignItems: "center", paddingBottom: 4 },
  footerText: { color: C.blue, fontSize: 10, letterSpacing: 4, fontFamily: "monospace" },
  footerSub: { color: C.blue + "44", fontSize: 7, letterSpacing: 2, fontFamily: "monospace", marginTop: 2 },

  ticker: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.blue + "11", paddingVertical: 6,
    paddingHorizontal: 10, borderTopWidth: 1,
    borderTopColor: C.blue + "22", overflow: "hidden",
  },
  tickerLabel: { fontSize: 14, marginRight: 8 },
  tickerText: { color: C.blue + "88", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 },

  chatHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: C.blue + "22" },
  chatTitle: { color: C.blue, fontSize: 14, fontWeight: "bold", letterSpacing: 4, fontFamily: "monospace" },

  msgWrap: { marginVertical: 3 },
  msgLeft: { alignItems: "flex-start" },
  msgRight: { alignItems: "flex-end" },
  msgSender: { color: C.blue, fontSize: 8, letterSpacing: 2, marginBottom: 2, fontFamily: "monospace" },
  bubble: { maxWidth: "82%", padding: 10, borderRadius: 6 },
  bubbleJarvis: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "33", borderTopLeftRadius: 0 },
  bubbleUser: { backgroundColor: C.blue + "1A", borderWidth: 1, borderColor: C.blue + "55", borderTopRightRadius: 0 },
  msgText: { color: C.text, fontSize: 14, fontFamily: "monospace", lineHeight: 20 },
  msgTime: { color: C.blue + "33", fontSize: 8, marginTop: 2, fontFamily: "monospace" },

  inputArea: {
    flexDirection: "row", padding: 8, gap: 8,
    borderTopWidth: 1, borderTopColor: C.blue + "22", backgroundColor: C.card,
    alignItems: "flex-end",
  },
  voiceBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  input: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1,
    borderColor: C.blue + "44", borderRadius: 4,
    padding: 10, color: C.text, fontFamily: "monospace",
    fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: C.blue, width: 44, height: 44,
    borderRadius: 4, alignItems: "center", justifyContent: "center",
  },

  dashCard: {
    backgroundColor: C.card, borderWidth: 1,
    borderColor: C.blue + "22", borderRadius: 8,
    padding: 12, position: "relative",
  },
  dashDot: { position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },

  navDots: {
    flexDirection: "row", justifyContent: "center",
    gap: 20, paddingVertical: 8, backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.blue + "22",
  },
  navBtn: { alignItems: "center", gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.blue + "33" },
  dotActive: { backgroundColor: C.blue, width: 20 },
  navLabel: { color: C.blue + "44", fontSize: 8, letterSpacing: 2, fontFamily: "monospace" },
});
