// Firebase config do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyBRIchI8qmVTE0vDUTu81gsjuDvvc7GASs",
  authDomain: "amigossite-b2962.firebaseapp.com",
  projectId: "amigossite-b2962",
  storageBucket: "amigossite-b2962.appspot.com",
  messagingSenderId: "202167250145",
  appId: "1:202167250145:web:d21f7f456226881c6a9ba0",
  measurementId: "G-MEFCX1WV48"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

let nomeAtual = "";

function entrar() {
  nomeAtual = document.getElementById("nomeUsuario").value.trim();
  if (!nomeAtual) return alert("Digite um nome!");

  document.getElementById("login").style.display = "none";
  document.getElementById("painel").style.display = "block";
  document.getElementById("bemvindo").innerText = `Olá, ${nomeAtual}!`;

  contarAmigos();
  carregarFeed();
}

function contarAmigos() {
  db.collection("amizades")
    .where("usuario", "==", nomeAtual)
    .get()
    .then(snapshot => {
      document.getElementById("amizade").innerText = `Amizade: ${snapshot.size}`;
    });
}

function postar() {
  const file = document.getElementById("imagemInput").files[0];
  const legenda = document.getElementById("legendaInput").value;

  if (!file || !legenda) return alert("Escolha uma imagem e escreva uma legenda!");

  const ref = storage.ref(`imagens/${Date.now()}_${file.name}`);
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {
      db.collection("posts").add({
        nome: nomeAtual,
        legenda: legenda,
        imagem: url,
        timestamp: Date.now()
      }).then(() => {
        carregarFeed();
        document.getElementById("imagemInput").value = "";
        document.getElementById("legendaInput").value = "";
      });
    });
  });
}

function adicionarAmigo(nome) {
  if (nome === nomeAtual) return;

  db.collection("amizades").add({
    usuario: nomeAtual,
    amigo: nome
  }).then(() => {
    contarAmigos();
    alert(`Você adicionou ${nome} como amigo!`);
  });
}

function carregarFeed() {
  db.collection("posts")
    .orderBy("timestamp", "desc")
    .limit(20)
    .get()
    .then(snapshot => {
      const feed = document.getElementById("feed");
      feed.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `
          <p><strong>${data.nome}</strong></p>
          <img src="${data.imagem}" alt="Imagem postada">
          <p>${data.legenda}</p>
          <button onclick="adicionarAmigo('${data.nome}')">Adicionar Amigo</button>
        `;
        feed.appendChild(div);
