import { useState, useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, SafeAreaView, Animated, Dimensions,
  PanResponder, Platform, KeyboardAvoidingView, Modal,
  Vibration, Linking, FlatList
} from "react-native";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");
const API = "http://10.148.123.146:8000";

const C = {
  bg: "#000510",
  blue: "#00D4FF",
  green: "#00FF88",
  orange: "#FF6B00",
  red: "#FF3366",
  purple: "#9D00FF",
  dim: "#003344",
  card: "#000D1A",
  text: "#CCF5FF",
};

const QUICK_CMDS = [
  "Battery kitni hai?",
  "Kuwait weather?",
  "Latest news?",
  "Search Elon Musk",
  "Time kya hai?",
];

// ===== HAPTIC =====
const haptic = () => Vibration.vibrate(50);

// ===== GLITCH TEXT =====
function GlitchText({ text, style }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={[style, glitch && { opacity: 0.7, transform: [{ translateX: 2 }] }]}>
      {glitch ? text.split("").map((c, i) =>
        Math.random() > 0.8 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : c
      ).join("") : text}
    </Text>
  );
}

// ===== TYPEWRITER =====
function TypewriterText({ text, style, speed = 30 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return <Text style={style}>{displayed}</Text>;
}

// ===== MATRIX RAIN =====
function MatrixRain() {
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";
  const columns = Math.floor(width / 16);
  const drops = useRef(
    Array.from({ length: columns }, () => ({
      y: new Animated.Value(-Math.random() * height),
      char: chars[Math.floor(Math.random() * chars.length)],
      x: 0,
    }))
  ).current;

  useEffect(() => {
    drops.forEach((drop, i) => {
      drop.x = i * 16;
      const animate = () => {
        drop.y.setValue(-20);
        Animated.timing(drop.y, {
          toValue: height + 20,
          duration: 2000 + Math.random() * 3000,
          delay: Math.random() * 2000,
          useNativeDriver: true,
        }).start(animate);
      };
      animate();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {drops.map((drop, i) => (
        <Animated.Text key={i} style={{
          position: "absolute",
          left: drop.x,
          color: C.green + "44",
          fontSize: 12,
          fontFamily: "monospace",
          transform: [{ translateY: drop.y }],
        }}>
          {chars[Math.floor(Math.random() * chars.length)]}
        </Animated.Text>
      ))}
    </View>
  );
}

// ===== PARTICLES =====
function Particles() {
  const particles = useRef(
    Array.from({ length: 15 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0),
      size: Math.random() * 3 + 1,
      color: [C.blue, C.green, C.orange][Math.floor(Math.random() * 3)],
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        p.x.setValue(Math.random() * width);
        p.y.setValue(height + 10);
        Animated.parallel([
          Animated.timing(p.y, { toValue: -10, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
        ]).start(animate);
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
          backgroundColor: p.color,
          opacity: p.opacity,
          transform: [{ translateX: p.x }, { translateY: p.y }],
        }} />
      ))}
    </View>
  );
}

// ===== RADAR SWEEP =====
function RadarSweep({ size }) {
  const angle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(angle, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = angle.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={{
      position: "absolute",
      width: size, height: size,
      transform: [{ rotate }],
    }}>
      <View style={{
        position: "absolute",
        width: size / 2, height: 1,
        right: size / 2, top: size / 2,
        backgroundColor: C.green,
        shadowColor: C.green, shadowRadius: 8, shadowOpacity: 1,
        transformOrigin: "right center",
      }} />
    </Animated.View>
  );
}

// ===== RING =====
function Ring({ size, color, speed, delay, reverse }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: speed || 4000, delay: delay || 0, useNativeDriver: true })
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
      shadowRadius: 6, shadowOpacity: 0.5,
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
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: C.bg,
          borderWidth: 2, borderColor: listening ? C.green : C.blue,
          alignItems: "center", justifyContent: "center",
          transform: [{ scale: pulse }],
          shadowColor: listening ? C.green : C.blue,
          shadowRadius: 20, shadowOpacity: 1, elevation: 20,
        }}>
          <Animated.View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: (listening ? C.green : C.blue) + "22",
            alignItems: "center", justifyContent: "center",
            opacity: glow,
          }}>
            <Text style={{ fontSize: 28 }}>{listening ? "🔴" : "⚡"}</Text>
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
    Animated.loop(
      Animated.timing(x, { toValue: -width * 3, duration: 20000, useNativeDriver: true })
    ).start();
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

// ===== CIRCULAR GAUGE =====
function CircularGauge({ value, max, color, label, unit }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.gauge}>
      <View style={[styles.gaugeOuter, { borderColor: color + "33" }]}>
        <View style={[styles.gaugeInner, { borderColor: color }]}>
          <Text style={[styles.gaugeVal, { color }]}>{value}{unit}</Text>
          <Text style={styles.gaugeLabel}>{label}</Text>
        </View>
      </View>
      <View style={[styles.gaugeFill, {
        width: `${pct}%`, backgroundColor: color,
        shadowColor: color, shadowRadius: 4, shadowOpacity: 1,
      }]} />
    </View>
  );
}

// ===== ACTION SCREEN =====
function ActionScreen({ visible, steps, result, onClose, webUrl }) {
  const [showWeb, setShowWeb] = useState(false);
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 50 }).start();
    } else {
      slideY.setValue(height);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.actionModal, { transform: [{ translateY: slideY }] }]}>
        {/* Header */}
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>⚡ JARVIS EXECUTING</Text>
          <TouchableOpacity onPress={() => { haptic(); onClose(); }}>
            <Text style={{ color: C.red, fontFamily: "monospace", fontSize: 12 }}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hudLine} />

        {showWeb && webUrl ? (
          <WebView source={{ uri: webUrl }} style={{ flex: 1 }} />
        ) : (
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Steps */}
            {steps.map((step, i) => (
              <View key={i} style={styles.actionStep}>
                <View style={[styles.stepDot, {
                  backgroundColor: step.done ? C.green : step.active ? C.blue : C.dim
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepText, {
                    color: step.done ? C.green : step.active ? C.blue : C.dim
                  }]}>
                    {step.icon} {step.text}
                  </Text>
                  {step.active && (
                    <Text style={styles.stepSub}>Processing...</Text>
                  )}
                </View>
                {step.done && <Text style={{ color: C.green, fontSize: 12 }}>✓</Text>}
              </View>
            ))}

            {/* Result */}
            {result && (
              <View style={styles.actionResult}>
                <Text style={styles.resultLabel}>◆ RESULT</Text>
                <TypewriterText text={result} style={styles.resultText} speed={20} />
                {webUrl && (
                  <TouchableOpacity style={styles.webBtn} onPress={() => setShowWeb(true)}>
                    <Text style={styles.webBtnText}>🌐 OPEN WEB VIEW</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

// ===== VOICE BTN =====
function VoiceBtn({ onPress, active }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])).start();
    } else scale.setValue(1);
  }, [active]);

  return (
    <TouchableOpacity onPress={() => { haptic(); onPress(); }}>
      <Animated.View style={[styles.voiceBtn, {
        backgroundColor: active ? C.red + "33" : C.green + "22",
        borderColor: active ? C.red : C.green,
        transform: [{ scale }],
      }]}>
        <Text style={{ fontSize: 18 }}>{active ? "🔴" : "🎤"}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ===== HUD SCREEN =====
function HUDScreen({ onChat, battery, time, weather, news, ram }) {
  const battNum = parseInt(battery) || 0;
  return (
    <View style={styles.screen}>
      <MatrixRain />
      <Particles />

      <View style={styles.hudHeader}>
        <GlitchText text="J.A.R.V.I.S" style={styles.hudTitle} />
        <Text style={styles.hudSub}>JUST A RATHER VERY INTELLIGENT SYSTEM</Text>
        <View style={styles.hudLine} />
      </View>

      {/* Corner brackets */}
      <View style={styles.cornerTL} /><View style={styles.cornerTR} />

      {/* Stats */}
      <View style={styles.statsRowTop}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>BATTERY</Text>
          <Text style={[styles.statChipVal, { color: battNum < 20 ? C.red : C.green }]}>{battery}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>RAM</Text>
          <Text style={styles.statChipVal}>{ram}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>STATUS</Text>
          <Text style={[styles.statChipVal, { color: C.green }]}>ONLINE</Text>
        </View>
      </View>

      {/* Reactor */}
      <View style={styles.reactorWrap}>
        <RadarSweep size={220} />
        <Ring size={200} color={C.blue + "22"} speed={12000} />
        <Ring size={165} color={C.blue + "44"} speed={9000} reverse />
        <Ring size={130} color={C.green + "44"} speed={6000} />
        <Ring size={100} color={C.blue + "77"} speed={3500} reverse />
        <Ring size={72} color={C.blue} speed={2000} />
        <ArcReactor onPress={onChat} />
      </View>

      {/* Weather + Time */}
      <View style={styles.bottomInfo}>
        <View style={styles.weatherCard}>
          <Text style={{ fontSize: 20 }}>🌤️</Text>
          <View>
            <Text style={styles.weatherLabel}>KUWAIT WEATHER</Text>
            <Text style={styles.weatherValue}>{weather || "Loading..."}</Text>
          </View>
        </View>
        <View style={styles.timeWrap}>
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.timeSub}>KUWAIT CITY • AST +3</Text>
        </View>
      </View>

      <View style={styles.hudFooter}>
        <Text style={styles.footerText}>[ TAP ⚡ TO ACTIVATE ]</Text>
      </View>

      <NewsTicker news={news} />
      <View style={styles.cornerBL} /><View style={styles.cornerBR} />
    </View>
  );
}

// ===== CHAT SCREEN =====
function ChatScreen({ messages, input, setInput, onSend, loading, voiceActive, onVoice }) {
  const scrollRef = useRef();
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>⚡ JARVIS CHAT</Text>
        <View style={styles.hudLine} />
      </View>

      {/* Quick Commands */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar}>
        {QUICK_CMDS.map((cmd, i) => (
          <TouchableOpacity key={i} style={styles.quickChip} onPress={() => { haptic(); setInput(cmd); }}>
            <Text style={styles.quickChipText}>{cmd}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgWrap, m.role === "user" ? styles.msgRight : styles.msgLeft]}>
            {m.role === "jarvis" && <Text style={styles.msgSender}>⚡ JARVIS</Text>}
            <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleJarvis]}>
              {m.role === "jarvis" ? (
                <TypewriterText text={m.text} style={styles.msgText} speed={15} />
              ) : (
                <Text style={styles.msgText}>{m.text}</Text>
              )}
            </View>
            <Text style={styles.msgTime}>{m.time}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.msgLeft}>
            <View style={styles.bubbleJarvis}>
              <Text style={{ color: C.blue, fontFamily: "monospace", fontSize: 12 }}>
                PROCESSING ●●●
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <VoiceBtn onPress={onVoice} active={voiceActive} />
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Enter command..."
          placeholderTextColor={C.dim}
          onSubmitEditing={onSend}
          multiline
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => { haptic(); onSend(); }}>
          <Text style={{ color: C.bg, fontSize: 16, fontWeight: "bold" }}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ===== DASHBOARD =====
function DashboardScreen({ battery, time, ram, weather }) {
  const battNum = parseInt(battery) || 0;
  const ramNum = parseInt(ram) || 0;

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>📊 SYSTEM DASHBOARD</Text>
        <View style={styles.hudLine} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>

        {/* Gauges */}
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <CircularGauge value={battNum} max={100} color={battNum < 20 ? C.red : C.green} label="BATTERY" unit="%" />
          <CircularGauge value={ramNum} max={100} color={C.orange} label="RAM" unit="%" />
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { icon: "🕐", label: "KUWAIT TIME", value: time, color: C.blue },
            { icon: "🌤️", label: "WEATHER", value: weather, color: C.green },
            { icon: "🧠", label: "AI MODEL", value: "LLAMA 70B", color: C.orange },
            { icon: "⚡", label: "STATUS", value: "ONLINE", color: C.green },
            { icon: "🎯", label: "SKILLS", value: "40+ ACTIVE", color: C.blue },
            { icon: "🔒", label: "SECURITY", value: "SECURE", color: C.purple },
          ].map((s, i) => (
            <View key={i} style={[styles.dashCard, { width: (width - 40) / 2 }]}>
              <Text style={{ fontSize: 22 }}>{s.icon}</Text>
              <Text style={{ color: s.color, fontSize: 8, letterSpacing: 2, marginTop: 4 }}>{s.label}</Text>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", fontFamily: "monospace" }}>
                {s.value || "--"}
              </Text>
              <View style={[styles.dashDot, { backgroundColor: s.color }]} />
            </View>
          ))}
        </View>

        {/* Network Speed */}
        <View style={styles.networkCard}>
          <Text style={styles.networkLabel}>📶 NETWORK STATUS</Text>
          <View style={styles.networkBar}>
            <View style={[styles.networkFill, { width: "75%", backgroundColor: C.blue }]} />
          </View>
          <Text style={styles.networkVal}>CONNECTED • WIFI</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [screen, setScreen] = useState(0);
  const [messages, setMessages] = useState([
    { role: "jarvis", text: "JARVIS ONLINE. All systems operational. Awaiting your command, Faizan.", time: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [battery, setBattery] = useState("--");
  const [ram, setRam] = useState("--");
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState("");
  const [news, setNews] = useState(["JARVIS SYSTEM ONLINE", "ALL SYSTEMS OPERATIONAL", "KUWAIT CITY • AST +3"]);

  // Action Screen
  const [actionVisible, setActionVisible] = useState(false);
  const [actionSteps, setActionSteps] = useState([]);
  const [actionResult, setActionResult] = useState("");
  const [actionWebUrl, setActionWebUrl] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Asia/Kuwait"
      }));
    }, 1000);

    fetch(`${API}/battery`).then(r => r.json()).then(d => {
      try { const b = JSON.parse(d.data); setBattery(`${b.percentage}%`); } catch {}
    }).catch(() => {});

    fetch(`${API}/search?q=Kuwait+weather+today`).then(r => r.json())
      .then(d => setWeather(d.result?.slice(0, 25) || "Clear ☀️"))
      .catch(() => setWeather("Clear ☀️"));

    fetch(`${API}/search?q=latest+news+today`).then(r => r.json())
      .then(d => {
        if (d.result) {
          const lines = d.result.split("\n").filter(l => l.trim().length > 10).slice(0, 5);
          if (lines.length) setNews(lines);
        }
      }).catch(() => {});

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

    // Detect action commands
    const isAction = /search|find|google|open|show|dekho|dhundo|batao/i.test(text);

    if (isAction) {
      // Show action screen
      setActionSteps([
        { icon: "🧠", text: "Analyzing command...", done: false, active: true },
        { icon: "🔍", text: "Searching information...", done: false, active: false },
        { icon: "📊", text: "Processing results...", done: false, active: false },
        { icon: "✅", text: "Preparing response...", done: false, active: false },
      ]);
      setActionResult("");
      setActionWebUrl("");
      setActionVisible(true);

      // Simulate steps
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 0 ? { ...st, done: true, active: false } : i === 1 ? { ...st, active: true } : st)), 800);
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 1 ? { ...st, done: true, active: false } : i === 2 ? { ...st, active: true } : st)), 1600);
      setTimeout(() => setActionSteps(s => s.map((st, i) => i === 2 ? { ...st, done: true, active: false } : i === 3 ? { ...st, active: true } : st)), 2400);
    }

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const response = data.response || "No response";

      setMessages(p => [...p, { role: "jarvis", text: response, time: t }]);

      if (isAction) {
        setActionSteps(s => s.map(st => ({ ...st, done: true, active: false })));
        setActionResult(response);

        // Check if web search needed
        if (/search|google|find/i.test(text)) {
          const query = text.replace(/search|google|find|me|batao|dikha/gi, "").trim();
          setActionWebUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        }
      }
    } catch {
      const errMsg = "CONNECTION ERROR. Start Termux: cd ~/jarvis && uvicorn api:app --host 0.0.0.0 --port 8000";
      setMessages(p => [...p, { role: "jarvis", text: errMsg, time: t }]);
      if (isAction) {
        setActionResult(errMsg);
        setActionSteps(s => s.map(st => ({ ...st, active: false })));
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} {...pan.panHandlers}>
      <StatusBar backgroundColor={C.bg} barStyle="light-content" />

      {screen === 0 && <HUDScreen onChat={() => { haptic(); setScreen(1); }}
        battery={battery} time={time} weather={weather} news={news} ram={ram} />}
      {screen === 1 && <ChatScreen messages={messages} input={input}
        setInput={setInput} onSend={sendMsg} loading={loading}
        voiceActive={voiceActive} onVoice={() => { haptic(); setVoiceActive(v => !v); }} />}
      {screen === 2 && <DashboardScreen battery={battery} time={time} ram={ram} weather={weather} />}

      {/* Action Screen */}
      <ActionScreen
        visible={actionVisible}
        steps={actionSteps}
        result={actionResult}
        webUrl={actionWebUrl}
        onClose={() => setActionVisible(false)}
      />

      {/* Nav */}
      <View style={styles.navDots}>
        {[{ label: "HUD", icon: "⚡" }, { label: "CHAT", icon: "💬" }, { label: "DASH", icon: "📊" }].map((item, i) => (
          <TouchableOpacity key={i} onPress={() => { haptic(); setScreen(i); }} style={styles.navBtn}>
            <Text style={{ fontSize: 14 }}>{item.icon}</Text>
            <View style={[styles.dot, screen === i && styles.dotActive]} />
            <Text style={[styles.navLabel, screen === i && { color: C.blue }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },
  hudLine: { height: 1, backgroundColor: C.blue + "33", width: "100%", marginTop: 8 },

  // HUD
  hudHeader: { alignItems: "center", paddingTop: 10, paddingHorizontal: 16 },
  hudTitle: {
    color: C.blue, fontSize: 22, fontWeight: "900",
    letterSpacing: 8, fontFamily: "monospace",
    textShadowColor: C.blue, textShadowRadius: 15,
  },
  hudSub: { color: C.blue + "55", fontSize: 6, letterSpacing: 3, marginTop: 2, fontFamily: "monospace" },

  // Corner brackets
  cornerTL: { position: "absolute", top: 60, left: 10, width: 20, height: 20, borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.blue + "66" },
  cornerTR: { position: "absolute", top: 60, right: 10, width: 20, height: 20, borderTopWidth: 1, borderRightWidth: 1, borderColor: C.blue + "66" },
  cornerBL: { position: "absolute", bottom: 50, left: 10, width: 20, height: 20, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: C.blue + "66" },
  cornerBR: { position: "absolute", bottom: 50, right: 10, width: 20, height: 20, borderBottomWidth: 1, borderRightWidth: 1, borderColor: C.blue + "66" },

  statsRowTop: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 12, paddingVertical: 6 },
  statChip: { alignItems: "center", backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "33", borderRadius: 6, padding: 6, minWidth: 85 },
  statChipLabel: { color: C.blue + "77", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
  statChipVal: { color: C.blue, fontSize: 13, fontWeight: "bold", fontFamily: "monospace" },

  reactorWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  bottomInfo: { paddingHorizontal: 12, gap: 6 },
  weatherCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.green + "33", borderRadius: 8, padding: 8 },
  weatherLabel: { color: C.green + "77", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
  weatherValue: { color: C.green, fontSize: 12, fontFamily: "monospace" },
  timeWrap: { alignItems: "center", paddingVertical: 4 },
  timeText: { color: C.blue, fontSize: 20, fontFamily: "monospace", fontWeight: "bold", letterSpacing: 3 },
  timeSub: { color: C.blue + "55", fontSize: 7, letterSpacing: 3, fontFamily: "monospace" },

  hudFooter: { alignItems: "center", paddingVertical: 4 },
  footerText: { color: C.blue + "88", fontSize: 9, letterSpacing: 4, fontFamily: "monospace" },

  ticker: { flexDirection: "row", alignItems: "center", backgroundColor: C.blue + "11", paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.blue + "22", overflow: "hidden" },
  tickerLabel: { fontSize: 12, marginRight: 6 },
  tickerText: { color: C.blue + "88", fontSize: 9, fontFamily: "monospace", letterSpacing: 1, width: width * 4 },

  // Chat
  chatHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: C.blue + "22" },
  chatTitle: { color: C.blue, fontSize: 13, fontWeight: "bold", letterSpacing: 4, fontFamily: "monospace" },

  quickBar: { maxHeight: 40, paddingHorizontal: 8, paddingVertical: 4 },
  quickChip: { backgroundColor: C.blue + "15", borderWidth: 1, borderColor: C.blue + "44", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  quickChipText: { color: C.blue, fontSize: 10, fontFamily: "monospace" },

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
  voiceBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.blue + "44", borderRadius: 4, padding: 8, color: C.text, fontFamily: "monospace", fontSize: 13, maxHeight: 80 },
  sendBtn: { backgroundColor: C.blue, width: 42, height: 42, borderRadius: 4, alignItems: "center", justifyContent: "center" },

  // Dashboard
  gauge: { alignItems: "center", gap: 4 },
  gaugeOuter: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  gaugeInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  gaugeVal: { fontSize: 16, fontWeight: "bold", fontFamily: "monospace" },
  gaugeLabel: { color: C.dim, fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
  gaugeFill: { height: 3, borderRadius: 2, alignSelf: "flex-start", marginTop: 4 },

  dashCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "22", borderRadius: 8, padding: 10, position: "relative" },
  dashDot: { position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },

  networkCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + "22", borderRadius: 8, padding: 12 },
  networkLabel: { color: C.blue, fontSize: 10, letterSpacing: 2, fontFamily: "monospace", marginBottom: 8 },
  networkBar: { height: 4, backgroundColor: C.dim, borderRadius: 2, overflow: "hidden" },
  networkFill: { height: "100%", borderRadius: 2 },
  networkVal: { color: C.green, fontSize: 10, fontFamily: "monospace", marginTop: 6 },

  // Action Screen
  actionModal: { position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.75, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.blue + "44", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  actionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  actionTitle: { color: C.blue, fontSize: 13, fontWeight: "bold", letterSpacing: 4, fontFamily: "monospace" },

  actionStep: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  stepDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  stepText: { fontFamily: "monospace", fontSize: 13, flex: 1 },
  stepSub: { color: C.dim, fontSize: 10, fontFamily: "monospace", marginTop: 4 },

  actionResult: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.green + "44", borderRadius: 8, padding: 12, marginTop: 8 },
  resultLabel: { color: C.green, fontSize: 9, letterSpacing: 3, fontFamily: "monospace", marginBottom: 8 },
  resultText: { color: C.text, fontSize: 13, fontFamily: "monospace", lineHeight: 20 },
  webBtn: { marginTop: 12, backgroundColor: C.blue + "22", borderWidth: 1, borderColor: C.blue, borderRadius: 6, padding: 10, alignItems: "center" },
  webBtnText: { color: C.blue, fontSize: 11, fontFamily: "monospace", letterSpacing: 2 },

  // Nav
  navDots: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 6, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.blue + "22" },
  navBtn: { alignItems: "center", gap: 2, paddingHorizontal: 20 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.blue + "33" },
  dotActive: { backgroundColor: C.blue, width: 16 },
  navLabel: { color: C.blue + "44", fontSize: 7, letterSpacing: 2, fontFamily: "monospace" },
});
