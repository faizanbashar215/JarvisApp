import { useState, useRef, useEffect } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, SafeAreaView
} from "react-native";

const API = "http://10.148.123.146:8000";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "jarvis", text: "Haan boss! Jarvis ready hai 🤖" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState("--");
  const [time, setTime] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    // Clock update
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Kuwait'
      }));
    }, 1000);

    // Battery
    fetch(`${API}/battery`)
      .then(r => r.json())
      .then(d => {
        const b = JSON.parse(d.data);
        setBattery(`${b.percentage}%`);
      })
      .catch(() => setBattery("--"));

    return () => clearInterval(timer);
  }, []);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "jarvis", text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "jarvis", text: "API connect nahi ho raha! Termux mein server check karo."
      }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd(), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View>
            <Text style={styles.headerName}>⚡ JARVIS AI</Text>
            <Text style={styles.headerSub}>by Faizan Bashar</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerInfo}>🔋 {battery}</Text>
          <Text style={styles.headerInfo}>🕐 {time}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgArea}
        contentContainerStyle={{ padding: 10 }}
      >
        {messages.map((m, i) => (
          <View key={i} style={[
            styles.msgWrap,
            m.role === "user" ? styles.msgRight : styles.msgLeft
          ]}>
            <View style={[
              styles.bubble,
              m.role === "user" ? styles.bubbleUser : styles.bubbleJarvis
            ]}>
              {m.role === "jarvis" && (
                <Text style={styles.senderName}>⚡ Jarvis</Text>
              )}
              <Text style={styles.msgText}>{m.text}</Text>
              <Text style={styles.msgTime}>
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={styles.msgLeft}>
            <View style={styles.bubbleJarvis}>
              <ActivityIndicator size="small" color="#075E54" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Kuch bhi pooch..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={sendMsg}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMsg}
          disabled={loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },

  // Header - WhatsApp green
  header: {
    backgroundColor: "#075E54",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#25D366",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerSub: { color: "#B2DFDB", fontSize: 11 },
  headerRight: { alignItems: "flex-end" },
  headerInfo: { color: "#B2DFDB", fontSize: 11 },

  // Messages
  msgArea: { flex: 1 },
  msgWrap: { marginVertical: 2 },
  msgLeft: { alignItems: "flex-start" },
  msgRight: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "80%", padding: 8, borderRadius: 8,
    elevation: 1, minWidth: 80,
  },
  bubbleJarvis: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  bubbleUser: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },

  senderName: { color: "#075E54", fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  msgText: { color: "#303030", fontSize: 15, lineHeight: 20 },
  msgTime: { color: "#999", fontSize: 10, alignSelf: "flex-end", marginTop: 2 },

  // Input
  inputArea: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    elevation: 1,
  },
  sendBtn: {
    backgroundColor: "#075E54",
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  sendIcon: { color: "#fff", fontSize: 20 },
});
