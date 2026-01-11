import React, { useState, useRef } from 'react';
import { useSettings, themeStyles, ThemeStyle, ProfileShape, ProfilePosition, Language, BorderRadius, borderRadiusOptions } from '../context/SettingsContext';
import { useM3Theme } from '../context/M3ThemeContext';
import { useMusicContext } from '../context/MusicContext';
import { CloseIcon, FolderIcon, PlusIcon, TrashIcon, UserIcon, SettingsIcon, GlobeIcon, PaletteIcon, MonitorIcon, SunIcon, MoonIcon } from './Icons';

declare const window: any;
const { ipcRenderer } = window.require('electron');

type SettingsSection = 'appearance' | 'language' | 'profile' | 'display' | 'directories';

// Navigation item component
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  colorScheme: any;
}> = ({ icon, label, active, onClick, colorScheme }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
    style={{
      background: active ? colorScheme.secondaryContainer : 'transparent',
      color: active ? colorScheme.onSecondaryContainer : colorScheme.onSurfaceVariant,
    }}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const SettingsModal: React.FC = () => {
  const { settings, updateSettings, t, showSettings, setShowSettings } = useSettings();
  const { colorScheme } = useM3Theme();
  const { loadMusicFolder, rescanAllFolders } = useMusicContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  if (!showSettings) return null;

  const handleTitlebarToggle = () => {
    updateSettings({ useCustomTitlebar: !settings.useCustomTitlebar });
    setShowRestartDialog(true);
  };

  const handleRestart = () => {
    ipcRenderer.send('app-restart');
  };

  const handleAddFolder = async () => {
    await loadMusicFolder();
  };

  const removeFolder = async (folder: string) => {
    updateSettings({
      musicFolders: settings.musicFolders.filter(f => f !== folder)
    });
    // Re-scan to update the library
    await rescanAllFolders();
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateSettings({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getShapeStyles = (shape: ProfileShape): React.CSSProperties => {
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '12px' };
      case 'square': return { borderRadius: '4px' };
      case 'squircle': return { borderRadius: '30%' };
      case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      default: return { borderRadius: '50%' };
    }
  };

  const getShapePreviewStyles = (shape: ProfileShape): React.CSSProperties => {
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '6px' };
      case 'square': return { borderRadius: '2px' };
      case 'squircle': return { borderRadius: '30%' };
      case 'hexagon': return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      default: return { borderRadius: '50%' };
    }
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  const sections: { id: SettingsSection; label: { en: string; es: string }; icon: React.ReactNode }[] = [
    { id: 'appearance', label: { en: 'Appearance', es: 'Apariencia' }, icon: <PaletteIcon size={18} /> },
    { id: 'language', label: { en: 'Language', es: 'Idioma' }, icon: <GlobeIcon size={18} /> },
    { id: 'profile', label: { en: 'Profile', es: 'Perfil' }, icon: <UserIcon size={18} /> },
    { id: 'display', label: { en: 'Display', es: 'Visualización' }, icon: <MonitorIcon size={18} /> },
    { id: 'directories', label: { en: 'Directories', es: 'Directorios' }, icon: <FolderIcon size={18} /> },
  ];

  // Toggle component
  const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <div
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: value ? colorScheme.primary : colorScheme.surfaceVariant }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? 'translateX(24px)' : 'translateX(4px)' }}
      />
    </div>
  );

  // Render content for each section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Apariencia' : 'Appearance'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es' ? 'Personaliza el aspecto de la aplicación' : 'Customize the look of the application'}
              </p>
            </div>

            {/* Theme Mode */}
            <div>
              <label className="text-sm font-medium mb-4 block" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Modo de tema' : 'Theme Mode'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'system' as const, label: { en: 'System', es: 'Sistema' }, Icon: MonitorIcon },
                  { mode: 'dark' as const, label: { en: 'Dark', es: 'Oscuro' }, Icon: MoonIcon },
                  { mode: 'light' as const, label: { en: 'Light', es: 'Claro' }, Icon: SunIcon },
                ].map(({ mode, label, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => updateSettings({ themeMode: mode })}
                    className="p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
                    style={{
                      background: settings.themeMode === mode ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                      border: settings.themeMode === mode ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                    }}
                  >
                    <div className="mb-2" style={{ color: settings.themeMode === mode ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant }}>
                      <Icon size={28} />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: settings.themeMode === mode ? colorScheme.onPrimaryContainer : colorScheme.onSurface }}
                    >
                      {label[settings.language]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Style */}
            <div>
              <label className="text-sm font-medium mb-4 block" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Estilo' : 'Style'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(themeStyles) as ThemeStyle[]).map(style => (
                  <button
                    key={style}
                    onClick={() => updateSettings({ themeStyle: style })}
                    className="p-4 rounded-xl transition-all duration-200 text-left"
                    style={{
                      background: settings.themeStyle === style ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                      border: settings.themeStyle === style ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: settings.themeStyle === style ? colorScheme.onPrimaryContainer : colorScheme.onSurface }}
                    >
                      {themeStyles[style].name[settings.language]}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: settings.themeStyle === style ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant }}
                    >
                      {themeStyles[style].description[settings.language]}
                    </div>
                  </button>
                ))}
              </div>

              {/* Adaptive Colors Toggle - Only shown when Classic theme is selected */}
              {settings.themeStyle === 'classic' && (
                <div
                  className="flex items-center justify-between p-4 mt-3 rounded-xl"
                  style={{ background: colorScheme.surfaceContainerHigh }}
                >
                  <div>
                    <span style={{ color: colorScheme.onSurface }}>
                      {settings.language === 'es' ? 'Colores Adaptativos' : 'Adaptive Colors'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: colorScheme.onSurfaceVariant }}>
                      {settings.language === 'es' ? 'Los colores cambian según el álbum' : 'Colors change based on album art'}
                    </p>
                  </div>
                  <Toggle
                    value={settings.adaptiveColors}
                    onChange={() => updateSettings({ adaptiveColors: !settings.adaptiveColors })}
                  />
                </div>
              )}
            </div>

            {/* Border Radius - Only shown for Classic theme */}
            {settings.themeStyle === 'classic' && (
              <div>
                <label className="text-sm font-medium mb-4 block" style={{ color: colorScheme.onSurface }}>
                  {settings.language === 'es' ? 'Bordes' : 'Corners'}
                </label>
                <div className="flex gap-2">
                  {(Object.keys(borderRadiusOptions) as BorderRadius[]).map(radius => (
                    <button
                      key={radius}
                      onClick={() => updateSettings({ borderRadius: radius })}
                      className="flex-1 p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
                      style={{
                        background: settings.borderRadius === radius ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                      }}
                      title={borderRadiusOptions[radius].label[settings.language]}
                    >
                      <div
                        className="w-8 h-8 border-2"
                        style={{
                          borderColor: settings.borderRadius === radius ? colorScheme.primary : colorScheme.onSurfaceVariant,
                          borderRadius: radius === 'none' ? '0' : radius === 'small' ? '3px' : radius === 'medium' ? '6px' : radius === 'large' ? '10px' : '12px',
                        }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: settings.borderRadius === radius ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant }}
                      >
                        {borderRadiusOptions[radius].label[settings.language].split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Idioma' : 'Language'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es' ? 'Selecciona el idioma de la aplicación' : 'Select the application language'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => updateSettings({ language: lang.code })}
                  className="p-4 rounded-xl text-base font-medium transition-all flex items-center gap-3"
                  style={{
                    background: settings.language === lang.code ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                    color: settings.language === lang.code ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant,
                    border: settings.language === lang.code ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Perfil' : 'Profile'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es' ? 'Personaliza tu perfil' : 'Customize your profile'}
              </p>
            </div>

            {/* Show Profile Toggle */}
            <div
              className="flex items-center justify-between p-4 rounded-xl mb-4"
              style={{ background: colorScheme.surfaceContainerHigh }}
            >
              <span style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Mostrar perfil' : 'Show Profile'}
              </span>
              <button
                onClick={() => updateSettings({ showProfile: !settings.showProfile })}
                className="w-12 h-7 rounded-full transition-all duration-200 relative"
                style={{
                  background: settings.showProfile ? colorScheme.primary : colorScheme.surfaceVariant,
                }}
              >
                <div
                  className="absolute top-1 w-5 h-5 rounded-full transition-all duration-200"
                  style={{
                    background: settings.showProfile ? colorScheme.onPrimary : colorScheme.outline,
                    left: settings.showProfile ? '26px' : '4px',
                  }}
                />
              </button>
            </div>

            {/* Profile Preview & Image */}
            <div className="flex items-center gap-6">
              <button onClick={handleImageSelect} className="relative group">
                <div
                  className="w-20 h-20 overflow-hidden flex items-center justify-center transition-all"
                  style={{
                    ...getShapeStyles(settings.profileShape),
                    background: settings.profilePicture
                      ? 'transparent'
                      : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                  }}
                >
                  {settings.profilePicture ? (
                    <img src={settings.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} style={{ color: colorScheme.onPrimary }} />
                  )}
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ ...getShapeStyles(settings.profileShape), background: 'rgba(0,0,0,0.5)' }}
                >
                  <span className="text-white text-xs font-medium">Edit</span>
                </div>
              </button>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block" style={{ color: colorScheme.onSurface }}>
                  {settings.language === 'es' ? 'Nombre' : 'Name'}
                </label>
                <input
                  type="text"
                  value={settings.profileName}
                  onChange={(e) => updateSettings({ profileName: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: colorScheme.surfaceContainerHigh, color: colorScheme.onSurface }}
                />
              </div>
            </div>

            {/* Shape Selection */}
            <div>
              <label className="text-sm font-medium mb-4 block" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Forma del avatar' : 'Avatar Shape'}
              </label>
              <div className="flex gap-3">
                {(['circle', 'rounded', 'square', 'squircle', 'hexagon'] as ProfileShape[]).map(shape => (
                  <button
                    key={shape}
                    onClick={() => updateSettings({ profileShape: shape })}
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all"
                    style={{
                      background: settings.profileShape === shape ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                    }}
                  >
                    <div
                      className="w-6 h-6"
                      style={{
                        ...getShapePreviewStyles(shape),
                        background: settings.profileShape === shape ? colorScheme.primary : colorScheme.onSurfaceVariant,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="text-sm font-medium mb-4 block" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Posición del perfil' : 'Profile Position'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { pos: 'topright' as ProfilePosition, label: settings.language === 'es' ? 'Arriba Derecha' : 'Top Right' },
                  { pos: 'sidebar' as ProfilePosition, label: 'Sidebar' },
                ].map(({ pos, label }) => (
                  <button
                    key={pos}
                    onClick={() => updateSettings({ profilePosition: pos })}
                    className="py-3 px-4 rounded-xl font-medium transition-all"
                    style={{
                      background: settings.profilePosition === pos ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                      color: settings.profilePosition === pos ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant,
                      border: settings.profilePosition === pos ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Options */}
            <div className="space-y-4">
              {settings.profilePosition === 'sidebar' && (
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: colorScheme.surfaceContainerHigh }}
                >
                  <span style={{ color: colorScheme.onSurface }}>
                    {settings.language === 'es' ? 'Nombre personalizado de app' : 'Custom app name'}
                  </span>
                  <Toggle
                    value={settings.useCustomAppName}
                    onChange={() => updateSettings({ useCustomAppName: !settings.useCustomAppName })}
                  />
                </div>
              )}

              {settings.profilePosition === 'sidebar' && settings.useCustomAppName && (
                <input
                  type="text"
                  value={settings.customAppName}
                  onChange={(e) => updateSettings({ customAppName: e.target.value })}
                  placeholder="App name"
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: colorScheme.surfaceContainerHigh, color: colorScheme.onSurface }}
                />
              )}

              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: colorScheme.surfaceContainerHigh }}
              >
                <span style={{ color: colorScheme.onSurface }}>
                  {settings.language === 'es' ? 'Mostrar estadísticas al hover' : 'Show stats on hover'}
                </span>
                <Toggle
                  value={settings.showStatsOnHover}
                  onChange={() => updateSettings({ showStatsOnHover: !settings.showStatsOnHover })}
                />
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Visualización' : 'Display'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es' ? 'Opciones de visualización' : 'Display options'}
              </p>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: colorScheme.surfaceContainerHigh }}
              >
                <span style={{ color: colorScheme.onSurface }}>
                  {settings.language === 'es' ? 'Mostrar portadas de playlists' : 'Show playlist covers'}
                </span>
                <Toggle
                  value={settings.showPlaylistCovers}
                  onChange={() => updateSettings({ showPlaylistCovers: !settings.showPlaylistCovers })}
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: colorScheme.surfaceContainerHigh }}
              >
                <div>
                  <span style={{ color: colorScheme.onSurface }}>
                    {settings.language === 'es' ? 'Barra de título personalizada' : 'Custom titlebar'}
                  </span>
                  <p className="text-xs mt-1" style={{ color: colorScheme.onSurfaceVariant }}>
                    {settings.language === 'es' ? 'Requiere reiniciar' : 'Requires restart'}
                  </p>
                </div>
                <Toggle
                  value={settings.useCustomTitlebar}
                  onChange={handleTitlebarToggle}
                />
              </div>
            </div>
          </div>
        );

      case 'directories':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Directorios' : 'Directories'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es' ? 'Carpetas de música' : 'Music folders'}
              </p>
            </div>

            <div className="space-y-3">
              {settings.musicFolders.length > 0 ? (
                settings.musicFolders.map((folder) => (
                  <div
                    key={folder}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: colorScheme.surfaceContainerHigh }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FolderIcon size={20} style={{ color: colorScheme.primary }} />
                      <div className="min-w-0">
                        <span className="block truncate font-medium" style={{ color: colorScheme.onSurface }}>
                          {folder.split('/').pop() || folder}
                        </span>
                        <span className="block truncate text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
                          {folder}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFolder(folder)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors ml-2"
                      style={{ color: colorScheme.error }}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div
                  className="text-center py-8 rounded-xl"
                  style={{ background: colorScheme.surfaceContainerHigh }}
                >
                  <FolderIcon size={48} className="mx-auto mb-3" style={{ color: colorScheme.onSurfaceVariant, opacity: 0.5 }} />
                  <span className="block" style={{ color: colorScheme.onSurfaceVariant }}>
                    {settings.language === 'es' ? 'Sin carpetas agregadas' : 'No folders added'}
                  </span>
                </div>
              )}

              <button
                onClick={handleAddFolder}
                className="w-full p-4 flex items-center justify-center gap-3 rounded-xl transition-colors hover:bg-white/5"
                style={{
                  border: `2px dashed ${colorScheme.outlineVariant}`,
                  color: colorScheme.primary,
                }}
              >
                <PlusIcon size={20} />
                <span className="font-medium">
                  {settings.language === 'es' ? 'Agregar Carpeta' : 'Add Folder'}
                </span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />

      <div
        className="relative w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex"
        style={{ background: colorScheme.surfaceContainerLow }}
      >
        {/* Left Sidebar Navigation */}
        <div
          className="w-56 flex-shrink-0 flex flex-col border-r"
          style={{ background: colorScheme.surface, borderColor: colorScheme.outlineVariant }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <SettingsIcon size={24} style={{ color: colorScheme.primary }} />
              <div>
                <h2 className="text-lg font-bold" style={{ color: colorScheme.onSurface }}>
                  {t('settings.title')}
                </h2>
                <p className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
                  {settings.language === 'es' ? 'Configura tu experiencia' : 'Manage your preferences'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-3 space-y-1">
            {sections.map(section => (
              <NavItem
                key={section.id}
                icon={section.icon}
                label={section.label[settings.language]}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                colorScheme={colorScheme}
              />
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: colorScheme.onSurfaceVariant }}
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {renderSectionContent()}
          </div>
        </div>

        {/* Hidden file input for profile image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Restart Dialog */}
        {showRestartDialog && (
          <div
            className="absolute inset-0 flex items-center justify-center z-[60]"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <div
              className="p-8 rounded-2xl max-w-sm mx-4 text-center"
              style={{ background: colorScheme.surfaceContainerHigh }}
            >
              <h3 className="text-xl font-semibold mb-3" style={{ color: colorScheme.onSurface }}>
                {settings.language === 'es' ? 'Reiniciar aplicación' : 'Restart application'}
              </h3>
              <p className="text-base mb-6" style={{ color: colorScheme.onSurfaceVariant }}>
                {settings.language === 'es'
                  ? 'Para aplicar este cambio es necesario reiniciar la aplicación.'
                  : 'To apply this change, the application needs to restart.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowRestartDialog(false)}
                  className="px-5 py-3 rounded-xl text-base transition-colors"
                  style={{ background: colorScheme.surfaceVariant, color: colorScheme.onSurfaceVariant }}
                >
                  {settings.language === 'es' ? 'Más tarde' : 'Later'}
                </button>
                <button
                  onClick={handleRestart}
                  className="px-5 py-3 rounded-xl text-base transition-colors"
                  style={{ background: colorScheme.primary, color: colorScheme.onPrimary }}
                >
                  {settings.language === 'es' ? 'Reiniciar ahora' : 'Restart now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
