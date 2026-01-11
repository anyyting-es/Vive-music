import React, { useState, useRef } from 'react';
import { useSettings, themeStyles, ThemeStyle, ProfileShape, ProfilePosition, Language, BorderRadius, borderRadiusOptions } from '../../context/SettingsContext';
import { useM3Theme } from '../../context/M3ThemeContext';
import { useMusicContext } from '../../context/MusicContext';
import { FolderIcon, PlusIcon, TrashIcon, UserIcon, ChevronDownIcon } from '../Icons';

declare const window: any;
const { ipcRenderer } = window.require('electron');

// Collapsible Section Component
const Section: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    colorScheme: any;
}> = ({ title, children, defaultOpen = false, colorScheme }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: colorScheme.surfaceContainer }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
                <span className="text-base font-medium" style={{ color: colorScheme.onSurface }}>
                    {title}
                </span>
                <ChevronDownIcon
                    size={20}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: colorScheme.onSurfaceVariant }}
                />
            </button>

            {isOpen && (
                <div
                    className="p-4 pt-0 animate-fade-in"
                    style={{ borderTop: `1px solid ${colorScheme.outlineVariant}` }}
                >
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsView: React.FC = () => {
    const { settings, updateSettings, t } = useSettings();
    const { colorScheme } = useM3Theme();
    const { loadMusicFolder } = useMusicContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showRestartDialog, setShowRestartDialog] = useState(false);

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

    const removeFolder = (folder: string) => {
        updateSettings({
            musicFolders: settings.musicFolders.filter(f => f !== folder)
        });
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

    return (
        <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
            {/* Header */}
            <div className="sticky top-0 z-10 px-8 py-6" style={{ background: 'var(--bg-main)' }}>
                <h1 className="text-3xl font-bold" style={{ color: colorScheme.onSurface }}>
                    {t('settings.title')}
                </h1>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />

            {/* Content */}
            <div className="px-8 pb-8 max-w-2xl space-y-4">

                {/* Appearance Section */}
                <Section title={settings.language === 'es' ? 'Apariencia' : 'Appearance'} defaultOpen={true} colorScheme={colorScheme}>
                    {/* Theme Mode (Dark/Light/System) */}
                    <div className="mb-6">
                        <label className="text-sm mb-3 block" style={{ color: colorScheme.onSurfaceVariant }}>
                            {settings.language === 'es' ? 'Modo' : 'Mode'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { mode: 'system' as const, label: { en: 'System', es: 'Sistema' }, icon: '💻' },
                                { mode: 'dark' as const, label: { en: 'Dark', es: 'Oscuro' }, icon: '🌙' },
                                { mode: 'light' as const, label: { en: 'Light', es: 'Claro' }, icon: '☀️' },
                            ].map(({ mode, label, icon }) => (
                                <button
                                    key={mode}
                                    onClick={() => updateSettings({ themeMode: mode })}
                                    className="p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
                                    style={{
                                        background: settings.themeMode === mode ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                                        border: settings.themeMode === mode ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                                    }}
                                >
                                    <span className="text-2xl">{icon}</span>
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

                    {/* Theme Style - 2 options: OLED and Classic */}
                    <div className="mb-6">
                        <label className="text-sm mb-3 block" style={{ color: colorScheme.onSurfaceVariant }}>
                            {settings.language === 'es' ? 'Estilo' : 'Style'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {(Object.keys(themeStyles) as ThemeStyle[]).map(style => (
                                <button
                                    key={style}
                                    onClick={() => updateSettings({ themeStyle: style })}
                                    className="p-4 rounded-xl transition-all duration-200 text-center"
                                    style={{
                                        background: settings.themeStyle === style ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                                        border: settings.themeStyle === style ? `2px solid ${colorScheme.primary}` : '2px solid transparent',
                                    }}
                                >
                                    <div
                                        className="text-base font-medium mb-1"
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
                            <label className="flex items-center justify-between cursor-pointer p-3 mt-3 rounded-xl hover:bg-white/5"
                                style={{ background: colorScheme.surfaceContainerHigh }}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium" style={{ color: colorScheme.onSurface }}>
                                        {settings.language === 'es' ? 'Colores Adaptativos' : 'Adaptive Colors'}
                                    </span>
                                    <span className="text-xs" style={{ color: colorScheme.onSurfaceVariant }}>
                                        {settings.language === 'es' ? 'Los colores cambian según el álbum' : 'Colors change based on album art'}
                                    </span>
                                </div>
                                <div
                                    onClick={() => updateSettings({ adaptiveColors: !settings.adaptiveColors })}
                                    className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                                    style={{ background: settings.adaptiveColors ? colorScheme.primary : colorScheme.surfaceVariant }}
                                >
                                    <div
                                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                        style={{ transform: settings.adaptiveColors ? 'translateX(22px)' : 'translateX(2px)' }}
                                    />
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Border Radius - Only shown for Classic theme */}
                    {settings.themeStyle === 'classic' && (
                        <div>
                            <label className="text-sm mb-3 block" style={{ color: colorScheme.onSurfaceVariant }}>
                                {settings.language === 'es' ? 'Bordes' : 'Corners'}
                            </label>
                            <div className="flex gap-2">
                                {(Object.keys(borderRadiusOptions) as BorderRadius[]).map(radius => (
                                    <button
                                        key={radius}
                                        onClick={() => updateSettings({ borderRadius: radius })}
                                        className="flex-1 p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
                                        style={{
                                            background: settings.borderRadius === radius ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                                        }}
                                        title={borderRadiusOptions[radius].label[settings.language]}
                                    >
                                        {/* Visual preview of border radius */}
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
                </Section>

                {/* Language Section */}
                <Section title={settings.language === 'es' ? 'Idioma' : 'Language'} colorScheme={colorScheme}>
                    <div className="flex gap-3">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => updateSettings({ language: lang.code })}
                                className="flex-1 py-3 px-4 rounded-xl text-base font-medium transition-all"
                                style={{
                                    background: settings.language === lang.code ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                                    color: settings.language === lang.code ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant,
                                }}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </Section>

                {/* Profile Section */}
                <Section title={settings.language === 'es' ? 'Perfil' : 'Profile'} colorScheme={colorScheme}>
                    {/* Profile Preview & Image Select */}
                    <div className="flex items-center gap-5 mb-5">
                        <button
                            onClick={handleImageSelect}
                            className="relative group"
                        >
                            <div
                                className="w-16 h-16 overflow-hidden flex items-center justify-center transition-all"
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
                                    <UserIcon size={28} style={{ color: colorScheme.onPrimary }} />
                                )}
                            </div>
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    ...getShapeStyles(settings.profileShape),
                                    background: 'rgba(0,0,0,0.5)'
                                }}
                            >
                                <span className="text-white text-xs font-medium">Edit</span>
                            </div>
                        </button>

                        <div className="flex-1">
                            <input
                                type="text"
                                value={settings.profileName}
                                onChange={(e) => updateSettings({ profileName: e.target.value })}
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                                style={{
                                    background: colorScheme.surfaceContainerHigh,
                                    color: colorScheme.onSurface,
                                }}
                            />
                        </div>
                    </div>

                    {/* Shape Selection */}
                    <div className="mb-5">
                        <label className="text-sm mb-3 block" style={{ color: colorScheme.onSurfaceVariant }}>
                            {settings.language === 'es' ? 'Forma' : 'Shape'}
                        </label>
                        <div className="flex gap-3">
                            {(['circle', 'rounded', 'square', 'squircle', 'hexagon'] as ProfileShape[]).map(shape => (
                                <button
                                    key={shape}
                                    onClick={() => updateSettings({ profileShape: shape })}
                                    className="w-11 h-11 flex items-center justify-center rounded-xl transition-all"
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
                    <div className="mb-5">
                        <label className="text-sm mb-3 block" style={{ color: colorScheme.onSurfaceVariant }}>
                            {settings.language === 'es' ? 'Posición' : 'Position'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { pos: 'topright' as ProfilePosition, label: settings.language === 'es' ? 'Arriba Derecha' : 'Top Right' },
                                { pos: 'sidebar' as ProfilePosition, label: 'Sidebar' },
                            ].map(({ pos, label }) => (
                                <button
                                    key={pos}
                                    onClick={() => updateSettings({ profilePosition: pos })}
                                    className="py-3 px-4 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        background: settings.profilePosition === pos ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh,
                                        color: settings.profilePosition === pos ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Extra Options */}
                    <div className="space-y-3">
                        {settings.profilePosition === 'sidebar' && (
                            <>
                                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5">
                                    <span className="text-sm" style={{ color: colorScheme.onSurface }}>
                                        {settings.language === 'es' ? 'Nombre personalizado' : 'Custom app name'}
                                    </span>
                                    <div
                                        onClick={() => updateSettings({ useCustomAppName: !settings.useCustomAppName })}
                                        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                                        style={{ background: settings.useCustomAppName ? colorScheme.primary : colorScheme.surfaceVariant }}
                                    >
                                        <div
                                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                            style={{ transform: settings.useCustomAppName ? 'translateX(22px)' : 'translateX(2px)' }}
                                        />
                                    </div>
                                </label>

                                {settings.useCustomAppName && (
                                    <input
                                        type="text"
                                        value={settings.customAppName}
                                        onChange={(e) => updateSettings({ customAppName: e.target.value })}
                                        placeholder="App name"
                                        className="w-full px-4 py-3 rounded-xl text-base outline-none"
                                        style={{
                                            background: colorScheme.surfaceContainerHigh,
                                            color: colorScheme.onSurface,
                                        }}
                                    />
                                )}
                            </>
                        )}

                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5">
                            <span className="text-sm" style={{ color: colorScheme.onSurface }}>
                                {settings.language === 'es' ? 'Mostrar estadísticas' : 'Show stats'}
                            </span>
                            <div
                                onClick={() => updateSettings({ showStatsOnHover: !settings.showStatsOnHover })}
                                className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                                style={{ background: settings.showStatsOnHover ? colorScheme.primary : colorScheme.surfaceVariant }}
                            >
                                <div
                                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                    style={{ transform: settings.showStatsOnHover ? 'translateX(22px)' : 'translateX(2px)' }}
                                />
                            </div>
                        </label>
                    </div>
                </Section>

                {/* Display Section */}
                <Section title={settings.language === 'es' ? 'Visualización' : 'Display'} colorScheme={colorScheme}>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5">
                        <span className="text-base" style={{ color: colorScheme.onSurface }}>
                            {settings.language === 'es' ? 'Mostrar portadas de playlists' : 'Show playlist covers'}
                        </span>
                        <div
                            onClick={() => updateSettings({ showPlaylistCovers: !settings.showPlaylistCovers })}
                            className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                            style={{ background: settings.showPlaylistCovers ? colorScheme.primary : colorScheme.surfaceVariant }}
                        >
                            <div
                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                style={{ transform: settings.showPlaylistCovers ? 'translateX(22px)' : 'translateX(2px)' }}
                            />
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5">
                        <div className="flex flex-col">
                            <span className="text-base" style={{ color: colorScheme.onSurface }}>
                                {settings.language === 'es' ? 'Barra de título personalizada' : 'Custom titlebar'}
                            </span>
                        </div>
                        <div
                            onClick={handleTitlebarToggle}
                            className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                            style={{ background: settings.useCustomTitlebar ? colorScheme.primary : colorScheme.surfaceVariant }}
                        >
                            <div
                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                style={{ transform: settings.useCustomTitlebar ? 'translateX(22px)' : 'translateX(2px)' }}
                            />
                        </div>
                    </label>
                </Section>

                {/* Restart Dialog */}
                {showRestartDialog && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-[60]"
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
                                    style={{
                                        background: colorScheme.surfaceVariant,
                                        color: colorScheme.onSurfaceVariant
                                    }}
                                >
                                    {settings.language === 'es' ? 'Más tarde' : 'Later'}
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="px-5 py-3 rounded-xl text-base transition-colors"
                                    style={{
                                        background: colorScheme.primary,
                                        color: colorScheme.onPrimary
                                    }}
                                >
                                    {settings.language === 'es' ? 'Reiniciar ahora' : 'Restart now'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Directories Section */}
                <Section title={settings.language === 'es' ? 'Directorios' : 'Directories'} colorScheme={colorScheme}>
                    <div className="space-y-3">
                        {settings.musicFolders.length > 0 ? (
                            settings.musicFolders.map((folder) => (
                                <div
                                    key={folder}
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ background: colorScheme.surfaceContainerHigh }}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FolderIcon size={18} style={{ color: colorScheme.primary }} />
                                        <span className="text-sm truncate" style={{ color: colorScheme.onSurface }}>
                                            {folder.split('/').pop() || folder}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFolder(folder)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                        style={{ color: colorScheme.error }}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <span className="text-sm" style={{ color: colorScheme.onSurfaceVariant }}>
                                    {settings.language === 'es' ? 'Sin carpetas' : 'No folders added'}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleAddFolder}
                            className="w-full p-3 flex items-center justify-center gap-3 rounded-xl transition-colors hover:bg-white/5"
                            style={{
                                border: `1px dashed ${colorScheme.outlineVariant}`,
                                color: colorScheme.primary,
                            }}
                        >
                            <PlusIcon size={18} />
                            <span className="text-sm font-medium">
                                {settings.language === 'es' ? 'Agregar Carpeta' : 'Add Folder'}
                            </span>
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default SettingsView;
