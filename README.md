# Vibe - Reproductor de Música Local 🎵

Un reproductor de música local moderno con interfaz tipo Spotify, hecho con Electron + React.

## Características ✨

- 🎵 Reproduce música local (MP3, FLAC, M4A, WAV, OGG, AAC)
- 📚 Organiza tu biblioteca por Álbumes, Artistas, Canciones
- 🎨 Interfaz moderna tipo Spotify con tema oscuro
- 🖼️ Muestra carátulas de álbumes automáticamente
- ⏯️ Controles completos de reproducción
- 🔊 Control de volumen
- 🔁 Repetición y reproducción aleatoria
- 💾 Guarda tu biblioteca automáticamente
- 🎨 Colores morados/rosas con gradientes

## Instalación 🚀

### Prerequisitos

Necesitas tener instalado Node.js (versión 16 o superior). Si no lo tienes:

**En Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar Vibe

1. Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias. Puede tardar unos minutos.

## Cómo Usar 🎧

### Iniciar la aplicación

```bash
npm start
```

Esto compilará el código y abrirá la aplicación.

### Modo desarrollo (con auto-recarga)

Si quieres hacer cambios y ver los resultados automáticamente:

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm start
```

### Agregar tu música

1. Haz clic en el botón **"📂 Add Music Folder"** en la parte inferior de la barra lateral
2. Selecciona la carpeta donde tienes tu música
3. La app escaneará automáticamente todos los archivos de música y leerá sus metadatos
4. ¡Listo! Tu música aparecerá organizada en la biblioteca

### Navegar por tu música

- **Home**: Vista general con estadísticas
- **Library > Albums**: Ver todos tus álbumes
- **Library > Tracks**: Lista de todas las canciones
- **Library > Album Artists**: Ver por artista
- Haz clic en cualquier álbum o artista para ver más detalles

### Reproducir música

- Haz clic en cualquier canción para reproducirla
- Usa los controles en la barra inferior para:
  - ⏯️ Play/Pausa
  - ⏭️⏮️ Siguiente/Anterior
  - 🔀 Reproducción aleatoria
  - 🔁 Repetir
  - 🔊 Control de volumen

## Estructura del Proyecto 📁

```
musicplayer/
├── src/
│   ├── components/          # Componentes React
│   │   ├── views/          # Vistas principales
│   │   ├── App.tsx
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   └── PlayerBar.tsx
│   ├── context/            # Estado global
│   │   └── MusicContext.tsx
│   ├── main.ts             # Proceso principal de Electron
│   ├── renderer.tsx        # Punto de entrada React
│   ├── types.ts            # TypeScript types
│   ├── styles.css          # Estilos globales
│   └── index.html          # HTML principal
├── dist/                   # Código compilado
├── package.json
├── tsconfig.json
├── webpack.config.js
└── tailwind.config.js
```

## Tecnologías Utilizadas 🛠️

- **Electron**: Framework para aplicaciones de escritorio
- **React**: Biblioteca de interfaz de usuario
- **TypeScript**: JavaScript con tipos
- **Tailwind CSS**: Framework de estilos
- **Howler.js**: Librería de audio
- **music-metadata**: Para leer metadatos de archivos de música
- **electron-store**: Para persistencia de datos

## Formatos de Audio Soportados 🎼

- MP3 (.mp3)
- FLAC (.flac)
- M4A (.m4a)
- WAV (.wav)
- OGG (.ogg)
- AAC (.aac)

## Solución de Problemas 🔧

### La aplicación no inicia

Asegúrate de haber instalado todas las dependencias:
```bash
rm -rf node_modules
npm install
npm start
```

### No se muestran las carátulas

Las carátulas se extraen automáticamente de los metadatos de los archivos de música. Asegúrate de que tus archivos MP3/FLAC tengan las carátulas embebidas.

### No se reproduce el audio

Verifica que los archivos de música estén en un formato soportado y no estén corruptos.

## Atajos de Teclado ⌨️

(Para agregar en futuras versiones)
- Espacio: Play/Pausa
- ← →: Anterior/Siguiente
- ↑ ↓: Volumen

## Créditos 👨‍💻

Desarrollado con ❤️ usando tecnologías modernas de código abierto.

---

¡Disfruta de tu música! 🎶
