import React, { useState, useEffect } from 'react';
import { useSettings, themeStyles, ThemeStyle, ThemeMode } from '../context/SettingsContext';
import { MusicIcon, ChevronRightIcon, FolderIcon, SearchIcon, TrashIcon } from './Icons';

declare const window: any;
const { ipcRenderer } = window.require('electron');

interface FolderEntry {
  path: string;
  fileCount: number | null; // null = checking, -1 = invalid/not found
  isDefault?: boolean;
}

const SetupWizard: React.FC = () => {
  const { settings, updateSettings, completeSetup, getThemeColors } = useSettings();
  const [step, setStep] = useState(0);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [newPath, setNewPath] = useState('');

  const texts = {
    en: {
      welcome: 'Welcome',
      subtitle: 'Set up your music player',
      language: 'Language',
      theme: 'Theme',
      style: 'Style',
      music: 'Music Library',
      dark: 'Dark',
      light: 'Light',
      continue: 'Continue',
      finish: 'Start',
      files: 'files',
      checking: 'Checking...',
      notFound: 'Not found',
      scanGlobal: 'Scan Entire System',
      notRecommended: 'not recommended',
      addPath: 'Add another path...',
      skip: 'Skip setup',
    },
    es: {
      welcome: 'Bienvenido',
      subtitle: 'Configura tu reproductor',
      language: 'Idioma',
      theme: 'Tema',
      style: 'Estilo',
      music: 'Biblioteca de música',
      dark: 'Oscuro',
      light: 'Claro',
      continue: 'Continuar',
      finish: 'Iniciar',
      files: 'archivos',
      checking: 'Verificando...',
      notFound: 'No encontrado',
      scanGlobal: 'Escanear Todo el Sistema',
      notRecommended: 'no recomendado',
      addPath: 'Agregar otra ruta...',
      skip: 'Saltar configuración',
    }
  };

  const txt = texts[settings.language];
  const steps = ['language', 'theme', 'style', 'music'];
  const colors = getThemeColors();

  // Initialize default music folder on mount
  useEffect(() => {
    const initDefaultFolder = async () => {
      const homePath = await ipcRenderer.invoke('get-home-path');
      const defaultMusicPath = `${homePath}/Music`;
      setFolders([{ path: defaultMusicPath, fileCount: null, isDefault: true }]);
      checkFolderFiles(defaultMusicPath, 0);
    };
    initDefaultFolder();
  }, []);

  const checkFolderFiles = async (folderPath: string, index: number) => {
    try {
      const files = await ipcRenderer.invoke('scan-music-folder', folderPath);
      setFolders(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].fileCount = files ? files.length : -1;
        }
        return updated;
      });
    } catch {
      setFolders(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].fileCount = -1;
        }
        return updated;
      });
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Save valid folders to settings
      const validFolders = folders
        .filter(f => f.fileCount !== null && f.fileCount > 0)
        .map(f => f.path);

      // Update settings and wait for save before restart
      updateSettings({ musicFolders: validFolders, isFirstLaunch: false });

      // Wait longer to ensure settings are saved to file
      setTimeout(() => {
        ipcRenderer.send('app-restart');
      }, 500);
    }
  };

  const handleSkip = async () => {
    // Set default music folder and complete setup
    const homePath = await ipcRenderer.invoke('get-home-path');
    const defaultMusicPath = `${homePath}/Music`;
    updateSettings({ musicFolders: [defaultMusicPath], isFirstLaunch: false });

    setTimeout(() => {
      ipcRenderer.send('app-restart');
    }, 500);
  };

  const handleBrowseFolder = async (index: number) => {
    const result = await ipcRenderer.invoke('select-folder');
    if (result) {
      setFolders(prev => {
        const updated = [...prev];
        updated[index] = { path: result, fileCount: null };
        return updated;
      });
      checkFolderFiles(result, index);
    }
  };

  const handlePathChange = (index: number, newPath: string) => {
    setFolders(prev => {
      const updated = [...prev];
      updated[index] = { path: newPath, fileCount: null };
      return updated;
    });
  };

  const handlePathBlur = (index: number) => {
    const folder = folders[index];
    if (folder && folder.path.trim()) {
      checkFolderFiles(folder.path, index);
    }
  };

  const addNewFolder = () => {
    if (newPath.trim()) {
      const newIndex = folders.length;
      setFolders(prev => [...prev, { path: newPath.trim(), fileCount: null }]);
      setNewPath('');
      checkFolderFiles(newPath.trim(), newIndex);
    }
  };

  const removeFolder = (index: number) => {
    setFolders(prev => prev.filter((_, i) => i !== index));
  };

  const handleGlobalScan = async () => {
    const homePath = await ipcRenderer.invoke('get-home-path');
    const newIndex = folders.length;
    setFolders(prev => [...prev, { path: homePath, fileCount: null }]);
    checkFolderFiles(homePath, newIndex);
  };

  const getFolderBorderColor = (folder: FolderEntry) => {
    if (folder.fileCount === null) return 'var(--border-color)'; // checking
    if (folder.fileCount > 0) return '#22c55e'; // green - has files
    return 'var(--border-color)'; // no files or not found
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--bg-main)' }}
    >
      <div className="w-full max-w-md p-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.primary }}
          >
            <MusicIcon size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {txt.welcome}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {txt.subtitle}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-0.5 rounded-full transition-all duration-300"
              style={{ background: i <= step ? colors.primary : 'var(--border-color)' }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {/* Language Step */}
          {step === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                {txt.language}
              </p>
              {[
                { code: 'en' as const, name: 'English' },
                { code: 'es' as const, name: 'Español' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => updateSettings({ language: lang.code })}
                  className="w-full p-3 rounded-lg border transition-all duration-200 text-left"
                  style={{
                    borderColor: settings.language === lang.code ? colors.primary : 'var(--border-color)',
                    background: settings.language === lang.code ? `${colors.primary}15` : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Theme Step */}
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                {txt.theme}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'dark' as ThemeMode, label: txt.dark },
                  { mode: 'light' as ThemeMode, label: txt.light },
                ].map(theme => (
                  <button
                    key={theme.mode}
                    onClick={() => updateSettings({ themeMode: theme.mode })}
                    className="p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2"
                    style={{
                      borderColor: settings.themeMode === theme.mode ? colors.primary : 'var(--border-color)',
                      background: settings.themeMode === theme.mode ? `${colors.primary}15` : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        border: `2px solid ${theme.mode === 'dark' ? '#333' : '#ddd'}`
                      }}
                    />
                    <span className="text-sm font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Style Step */}
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                {txt.style}
              </p>
              {(Object.keys(themeStyles) as ThemeStyle[]).map(style => (
                <button
                  key={style}
                  onClick={() => updateSettings({ themeStyle: style })}
                  className="w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center gap-3"
                  style={{
                    borderColor: settings.themeStyle === style ? colors.primary : 'var(--border-color)',
                    background: settings.themeStyle === style ? `${colors.primary}15` : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md"
                    style={{
                      background: style === 'oled'
                        ? '#000000'
                        : 'linear-gradient(135deg, #1a1a1a, #2a2a2a)'
                    }}
                  />
                  <div>
                    <span className="text-sm font-medium block">{themeStyles[style].name[settings.language]}</span>
                    <span className="text-xs opacity-60">{themeStyles[style].description[settings.language]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Music Library Step */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                {txt.music}
              </p>

              {/* Folder entries */}
              {folders.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all duration-300"
                  style={{ borderColor: getFolderBorderColor(folder) }}
                >
                  {/* Checkmark for valid folders */}
                  <div className="w-5 flex-shrink-0">
                    {folder.fileCount !== null && folder.fileCount > 0 && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>

                  {/* Path input */}
                  <input
                    type="text"
                    value={folder.path}
                    onChange={(e) => handlePathChange(index, e.target.value)}
                    onBlur={() => handlePathBlur(index)}
                    className="flex-1 bg-transparent text-sm outline-none min-w-0"
                    style={{ color: 'var(--text-primary)' }}
                  />

                  {/* File count */}
                  <span className="text-xs flex-shrink-0 px-2" style={{ color: 'var(--text-secondary)' }}>
                    {folder.fileCount === null
                      ? txt.checking
                      : folder.fileCount === -1
                        ? txt.notFound
                        : `${folder.fileCount} ${txt.files}`}
                  </span>

                  {/* Browse button */}
                  <button
                    onClick={() => handleBrowseFolder(index)}
                    className="p-1.5 rounded transition-colors hover:bg-white/10 flex-shrink-0"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <FolderIcon size={16} />
                  </button>

                  {/* Remove button (not for default) */}
                  {!folder.isDefault && (
                    <button
                      onClick={() => removeFolder(index)}
                      className="p-1.5 rounded transition-colors hover:bg-red-500/20 flex-shrink-0"
                      style={{ color: '#ef4444' }}
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add new path input */}
              <div
                className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewFolder()}
                  placeholder={txt.addPath}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  onClick={async () => {
                    const result = await ipcRenderer.invoke('select-folder');
                    if (result) {
                      const newIndex = folders.length;
                      setFolders(prev => [...prev, { path: result, fileCount: null }]);
                      checkFolderFiles(result, newIndex);
                    }
                  }}
                  className="p-1.5 rounded transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FolderIcon size={16} />
                </button>
              </div>

              {/* Global scan option */}
              <button
                onClick={handleGlobalScan}
                className="w-full p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {txt.scanGlobal} <span className="text-xs" style={{ color: '#ef4444' }}>({txt.notRecommended})</span>
                </span>
                <div
                  className="w-6 h-0.5 rounded"
                  style={{ background: 'var(--text-secondary)' }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
          style={{ background: colors.primary, color: 'white' }}
        >
          <span className="text-sm">{step === steps.length - 1 ? txt.finish : txt.continue}</span>
          <ChevronRightIcon size={16} />
        </button>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="w-full py-2 mt-3 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {txt.skip}
        </button>
      </div>
    </div>
  );
};

export default SetupWizard;
