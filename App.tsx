
import React, { useState, useEffect } from 'react';

// --- Reusable UI Components ---

const FormLabel: React.FC<{ htmlFor: string; required?: boolean; children: React.ReactNode; }> = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold text-[#335B84] mt-4 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Checkbox: React.FC<{ id: string; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children: React.ReactNode; }> = ({ id, name, checked, onChange, children }) => (
    <div className="flex items-center">
        <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-[#2D7BC2] focus:ring-[#2D7BC2]" />
        <label htmlFor={id} className="ml-2 block text-sm font-normal text-[#22344A]">{children}</label>
    </div>
);

const TabButton: React.FC<{ id: string; controls: string; isSelected: boolean; onClick: () => void; children: React.ReactNode }> = ({ id, controls, isSelected, onClick, children }) => (
    <button
        type="button"
        role="tab"
        id={id}
        aria-controls={controls}
        aria-selected={isSelected}
        onClick={onClick}
        className={`px-6 py-3 text-lg font-bold rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D7BC2] transition-colors duration-200 ${
            isSelected
                ? 'bg-white text-[#2D7BC2] border-b-4 border-[#2D7BC2]'
                : 'bg-gray-100 text-[#6080A3] hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void; }> = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const baseClasses = "p-4 mb-4 rounded-lg text-center font-bold";
    const typeClasses = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

    return (
        <div role="alert" aria-live="assertive" className={`${baseClasses} ${typeClasses}`}>
            {message}
            <button onClick={onDismiss} className="ml-4 font-bold text-xl" aria-label="Dismiss notification">&times;</button>
        </div>
    );
};

// --- Data for Form Fields ---

const MATERIAS = {
    infantil: [
        'Comunicación y Representación de la Realidad',
        'Crecimiento en Armonía',
        'Descubrimiento y Exploración del Entorno',
    ].sort(),
    primaria: [
        'Conocimiento del Medio Natural, Social y Cultural',
        'Educación Artística',
        'Educación en Valores Cívicos y Éticos',
        'Educación Física',
        'Lengua Castellana y Literatura',
        'Lengua Extranjera',
        'Lengua Vasca y Literatura',
        'Matemáticas',
    ].sort(),
    secundaria: [
        'Biología y Geología',
        'Educación en Valores Cívicos y Éticos',
        'Educación Física',
        'Educación Plástica, Visual y Audiovisual',
        'Física y Química',
        'Geografía e Historia',
        'Lengua Castellana y Literatura',
        'Lengua Extranjera',
        'Lengua Vasca y Literatura',
        'Matemáticas',
        'Música',
        'Tecnología y Digitalización',
    ].sort(),
};

// --- Main App Component ---

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('descripcion');
    const [notification, setNotification] = useState({ message: '', type: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState({
        tipo_rea: '',
        titulo: '',
        autoria: '',
        autoriaEspecificar: '',
        idioma: '',
        descripcion: '',
        licencia: '',
        destinatario: '',
        materias: [] as string[],
        cursos: '',
        competencias_clave: {
            comp_ccl: false, comp_cp: false, comp_stem: false, comp_cd: false,
            comp_cpsaa: false, comp_cc: false, comp_ce: false, comp_ccec: false,
        },
        competencias_especificas: '',
        saberes_basicos: '',
        metodologias: {
            met_abp: false, met_problemas: false, met_cooperativo: false, met_flipped: false,
            met_gamificacion: false, met_servicio: false, met_sda: false, met_descubrimiento: false,
            met_rincones: false, met_globalizado: false, met_steam: false, met_design: false, met_otras: false,
        },
        num_sesiones: '',
        agrupamientos: {
            agr_individual: false, agr_parejas: false, agr_pequeno: false, agr_medio: false,
            agr_grande: false, agr_heterogeneo: false, agr_homogeneo: false, agr_flexible: false,
        },
    });

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: 'success' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { id, checked, name: groupName } = e.target as HTMLInputElement;

            // Handle 'materias' array
            if (groupName === 'materias') {
                setFormData(prev => ({
                    ...prev,
                    materias: checked
                        ? [...prev.materias, id]
                        : prev.materias.filter(m => m !== id)
                }));
            } else { // Handle other checkbox groups (objects with boolean flags)
                setFormData(prev => ({
                    ...prev,
                    [groupName]: { ...prev[groupName as keyof typeof prev], [id]: checked },
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };
    
    const handleGuardarREA = () => {
        if (!formData.titulo.trim()) {
            showNotification('Por favor, completa al menos el título del REA', 'error');
            return;
        }
        showNotification(`✓ REA guardado correctamente: ${formData.titulo}`, 'success');
    };

    const getProcessedData = () => {
        const { autoriaEspecificar, ...data } = formData;
        const processedData = { ...data };

        // Combine autoria fields
        if (formData.autoria && formData.autoria !== 'ikasNOVA' && autoriaEspecificar) {
            processedData.autoria = `${formData.autoria}: ${autoriaEspecificar}`;
        }

        // Clean up checkbox objects into arrays of keys
        Object.keys(processedData).forEach(key => {
            const value = processedData[key as keyof typeof processedData];
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                const selectedKeys = Object.entries(value)
                    .filter(([, isSelected]) => isSelected)
                    .map(([itemKey]) => itemKey);
                (processedData as any)[key] = selectedKeys;
            }
        });
        return processedData;
    }

    const triggerDownload = (filename: string, blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportarCSV = () => {
        const data = getProcessedData();
        const finalTitle = data.titulo.trim() || 'Sin título';
        
        let csvContent = 'Campo,Valor\n';
        csvContent += `titulo,"${finalTitle}"\n`;
        
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'titulo') return; // Already added
            const formattedValue = `"${String(Array.isArray(value) ? value.join(', ') : value).replace(/"/g, '""')}"`;
            csvContent += `${key},${formattedValue}\n`;
        });

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(`REA_${finalTitle.replace(/\s+/g, '_')}.csv`, blob);
    };

    const handleExportJSON = () => {
        const data = getProcessedData();
        const finalTitle = data.titulo.trim() || 'Sin título';
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        triggerDownload(`REA_${finalTitle.replace(/\s+/g, '_')}.json`, blob);
    };

    const commonInputStyles = "w-full mt-1 p-2.5 rounded-md border border-[#A9CBE8] bg-[#F0F6FA] text-[#22344A] focus:outline-none focus:ring-2 focus:ring-[#2D7BC2] focus:bg-[#ECF3FB] transition-colors duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed";
    const checkboxContainerStyles = "bg-[#F0F6FA] p-4 rounded-md border border-[#A9CBE8] my-2 space-y-3";
    const areCurricularFieldsDisabled = formData.materias.length === 0 && !formData.cursos.trim();
    const showAutoriaEspecificar = formData.autoria && formData.autoria !== 'ikasNOVA' && formData.autoria !== '';

    return (
        <main className="bg-[#F5F7FB] min-h-screen text-[#22344A] font-['Roboto_Condensed'] py-8">
            <div className="container bg-white max-w-[900px] my-8 mx-auto py-10 px-9 rounded-xl shadow-lg border-2 border-[#CDF1F4]">
                <header>
                    <h1 className="text-4xl font-bold text-[#2D7BC2] mb-2">Etiquetado REA ikasNOVA</h1>
                    <p className="text-[#6080A3] mb-6">Completa los campos para catalogar tu Recurso Educativo Abierto</p>
                </header>

                <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: 'success' })} />

                <form onSubmit={(e) => e.preventDefault()} aria-labelledby="form-title">
                    
                    <div role="tablist" aria-label="Categorías del formulario" className="flex border-b border-gray-300 -mb-px">
                        <TabButton id="tab-descripcion" controls="panel-descripcion" isSelected={activeTab === 'descripcion'} onClick={() => setActiveTab('descripcion')}>
                            1. Descripción
                        </TabButton>
                        <TabButton id="tab-curricular" controls="panel-curricular" isSelected={activeTab === 'curricular'} onClick={() => setActiveTab('curricular')}>
                            2. Ref. Curriculares
                        </TabButton>
                        <TabButton id="tab-didactica" controls="panel-didactica" isSelected={activeTab === 'didactica'} onClick={() => setActiveTab('didactica')}>
                            3. Prop. Didáctica
                        </TabButton>
                    </div>

                    {/* --- TAB PANEL 1: DESCRIPCIÓN --- */}
                    <section id="panel-descripcion" role="tabpanel" aria-labelledby="tab-descripcion" hidden={activeTab !== 'descripcion'} className="py-6 focus:outline-none" tabIndex={-1}>
                        <FormLabel htmlFor="tipo_rea" required>Tipo de REA:</FormLabel>
                        <select id="tipo_rea" name="tipo_rea" value={formData.tipo_rea} onChange={handleChange} required className={`${commonInputStyles} font-bold bg-[#2DC2C2] border-none text-black text-[1.15em] mb-6`}>
                            <option value="">Selecciona el tipo de recurso...</option>
                            <option value="sda">Secuencia didáctica (SdA)</option>
                            <option value="actividad">Ficha de actividad</option>
                            <option value="infografia">Infografía</option>
                            <option value="video">Vídeo educativo</option>
                            <option value="presentacion">Presentación interactiva</option>
                            <option value="tabla">Tabla o esquema</option>
                            <option value="juego">Juego o gamificación</option>
                            <option value="simulador">Simulador</option>
                            <option value="guia">Guía didáctica</option>
                            <option value="otro">Otro (especificar)</option>
                        </select>
                        
                        <FormLabel htmlFor="titulo" required>Título:</FormLabel>
                        <input id="titulo" name="titulo" type="text" placeholder="Introduce el título del REA" value={formData.titulo} onChange={handleChange} className={commonInputStyles} required />
                        
                        <div className="flex flex-col md:flex-row md:gap-5 md:items-end">
                            <div className="flex-1">
                                <FormLabel htmlFor="autoria">Autoría:</FormLabel>
                                <select id="autoria" name="autoria" value={formData.autoria} onChange={handleChange} className={commonInputStyles}>
                                    <option value="">Selecciona...</option>
                                    <option value="Autor/a individual">Autor/a individual</option>
                                    <option value="Equipo de autores">Equipo de autores</option>
                                    <option value="Institución/Centro educativo">Institución/Centro educativo</option>
                                    <option value="ikasNOVA">ikasNOVA</option>
                                    <option value="Otros (especificar)">Otros (especificar)</option>
                                </select>
                            </div>
                            {showAutoriaEspecificar && (
                                <div className="flex-1">
                                    <FormLabel htmlFor="autoriaEspecificar">Nombre de autor/a, equipo o centro:</FormLabel>
                                    <input id="autoriaEspecificar" name="autoriaEspecificar" type="text" placeholder="Especifique aquí" value={formData.autoriaEspecificar} onChange={handleChange} className={commonInputStyles} />
                                </div>
                            )}
                        </div>

                         <FormLabel htmlFor="idioma" required>Idioma:</FormLabel>
                        <select id="idioma" name="idioma" value={formData.idioma} onChange={handleChange} className={commonInputStyles} required>
                            <option value="">Selecciona...</option>
                            <option>Castellano</option> <option>Euskera</option> <option>Inglés</option> <option>Francés</option> <option>Alemán</option> <option>Multilingüe (especificar)</option>
                        </select>

                        <FormLabel htmlFor="descripcion">Descripción:</FormLabel>
                        <textarea id="descripcion" name="descripcion" rows={4} placeholder="Resumen del contenido y propósito educativo del recurso" value={formData.descripcion} onChange={handleChange} className={commonInputStyles}></textarea>

                        <div className="flex flex-col md:flex-row md:gap-5">
                            <div className="flex-1">
                                <FormLabel htmlFor="licencia" required>Licencia Creative Commons:</FormLabel>
                                <select id="licencia" name="licencia" value={formData.licencia} onChange={handleChange} className={commonInputStyles} required>
                                    <option value="">Selecciona...</option>
                                    <option>CC BY (Reconocimiento)</option>
                                    <option>CC BY-SA (Reconocimiento-CompartirIgual)</option>
                                    <option>CC BY-NC (Reconocimiento-NoComercial)</option>
                                    <option>CC BY-NC-SA (Reconocimiento-NoComercial-CompartirIgual)</option>
                                    <option>CC BY-ND (Reconocimiento-SinObraDerivada)</option>
                                    <option>CC BY-NC-ND (Reconocimiento-NoComercial-SinObraDerivada)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <FormLabel htmlFor="destinatario" required>Destinatario (etapa):</FormLabel>
                                <select id="destinatario" name="destinatario" value={formData.destinatario} onChange={handleChange} className={commonInputStyles} required>
                                     <option value="">Selecciona...</option>
                                     <option>Infantil (0-3 años)</option> <option>Infantil (3-6 años)</option> <option>Primaria 1º-6º</option>
                                     <option>ESO 1º-4º</option> <option>Bachillerato</option> <option>Formación Profesional</option> <option>Educación de Personas Adultas</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    
                    {/* --- TAB PANEL 2: REFERENCIAS CURRICULARES --- */}
                    <section id="panel-curricular" role="tabpanel" aria-labelledby="tab-curricular" hidden={activeTab !== 'curricular'} className="py-6 focus:outline-none" tabIndex={-1}>
                        <FormLabel htmlFor="materias">Materias:</FormLabel>
                        <div className={checkboxContainerStyles} id="materias">
                            <h3 className="font-bold text-gray-700">Educación Infantil</h3>
                            {MATERIAS.infantil.map(m => <Checkbox key={m} id={m} name="materias" checked={formData.materias.includes(m)} onChange={handleChange}>{m}</Checkbox>)}
                            <h3 className="font-bold text-gray-700 pt-2">Educación Primaria</h3>
                            {MATERIAS.primaria.map(m => <Checkbox key={m} id={m} name="materias" checked={formData.materias.includes(m)} onChange={handleChange}>{m}</Checkbox>)}
                             <h3 className="font-bold text-gray-700 pt-2">Educación Secundaria</h3>
                            {MATERIAS.secundaria.map(m => <Checkbox key={m} id={m} name="materias" checked={formData.materias.includes(m)} onChange={handleChange}>{m}</Checkbox>)}
                        </div>
                        
                        <FormLabel htmlFor="cursos">Cursos (nivel):</FormLabel>
                        <input id="cursos" name="cursos" type="text" placeholder="Ej: 3º y 4º de Primaria" value={formData.cursos} onChange={handleChange} className={commonInputStyles} />
                        
                        <p className="text-sm text-[#6080A3] mt-4">Para activar los campos siguientes, selecciona al menos una materia o indica un curso.</p>

                        <FormLabel htmlFor="competencias_especificas">Competencias específicas:</FormLabel>
                        <textarea id="competencias_especificas" name="competencias_especificas" rows={3} placeholder={areCurricularFieldsDisabled ? "Selecciona una materia o curso para activar" : "Indica las competencias específicas..."} value={formData.competencias_especificas} onChange={handleChange} className={commonInputStyles} disabled={areCurricularFieldsDisabled}></textarea>
                        
                        <FormLabel htmlFor="saberes_basicos">Saberes básicos:</FormLabel>
                        <textarea id="saberes_basicos" name="saberes_basicos" rows={3} placeholder={areCurricularFieldsDisabled ? "Selecciona una materia o curso para activar" : "Ej: Sentido numérico, Comunicación oral..."} value={formData.saberes_basicos} onChange={handleChange} className={commonInputStyles} disabled={areCurricularFieldsDisabled}></textarea>

                        <FormLabel htmlFor="competencias_clave">Competencias clave LOMLOE:</FormLabel>
                        <div className={checkboxContainerStyles}>
                           <Checkbox id="comp_ccl" name="competencias_clave" checked={formData.competencias_clave.comp_ccl} onChange={handleChange}>CCL - Competencia en comunicación lingüística</Checkbox>
                           <Checkbox id="comp_cp" name="competencias_clave" checked={formData.competencias_clave.comp_cp} onChange={handleChange}>CP - Competencia plurilingüe</Checkbox>
                           <Checkbox id="comp_stem" name="competencias_clave" checked={formData.competencias_clave.comp_stem} onChange={handleChange}>STEM - Competencia matemática y en ciencia, tecnología e ingeniería</Checkbox>
                           <Checkbox id="comp_cd" name="competencias_clave" checked={formData.competencias_clave.comp_cd} onChange={handleChange}>CD - Competencia digital</Checkbox>
                           <Checkbox id="comp_cpsaa" name="competencias_clave" checked={formData.competencias_clave.comp_cpsaa} onChange={handleChange}>CPSAA - Competencia personal, social y de aprender a aprender</Checkbox>
                           <Checkbox id="comp_cc" name="competencias_clave" checked={formData.competencias_clave.comp_cc} onChange={handleChange}>CC - Competencia ciudadana</Checkbox>
                           <Checkbox id="comp_ce" name="competencias_clave" checked={formData.competencias_clave.comp_ce} onChange={handleChange}>CE - Competencia emprendedora</Checkbox>
                           <Checkbox id="comp_ccec" name="competencias_clave" checked={formData.competencias_clave.comp_ccec} onChange={handleChange}>CCEC - Competencia en conciencia y expresión culturales</Checkbox>
                        </div>
                    </section>

                     {/* --- TAB PANEL 3: PROPUESTA DIDÁCTICA --- */}
                     <section id="panel-didactica" role="tabpanel" aria-labelledby="tab-didactica" hidden={activeTab !== 'didactica'} className="py-6 focus:outline-none" tabIndex={-1}>
                        <div className="flex flex-col md:flex-row md:gap-8">
                            <div className="flex-1">
                                 <FormLabel htmlFor="metodologias">Metodologías:</FormLabel>
                                 <div className={checkboxContainerStyles}>
                                    <Checkbox id="met_abp" name="metodologias" checked={formData.metodologias.met_abp} onChange={handleChange}>Aprendizaje Basado en Proyectos (ABP)</Checkbox>
                                    <Checkbox id="met_problemas" name="metodologias" checked={formData.metodologias.met_problemas} onChange={handleChange}>Aprendizaje Basado en Problemas</Checkbox>
                                    <Checkbox id="met_cooperativo" name="metodologias" checked={formData.metodologias.met_cooperativo} onChange={handleChange}>Aprendizaje Cooperativo</Checkbox>
                                    <Checkbox id="met_flipped" name="metodologias" checked={formData.metodologias.met_flipped} onChange={handleChange}>Flipped Classroom (Aula Invertida)</Checkbox>
                                    <Checkbox id="met_gamificacion" name="metodologias" checked={formData.metodologias.met_gamificacion} onChange={handleChange}>Gamificación</Checkbox>
                                    <Checkbox id="met_servicio" name="metodologias" checked={formData.metodologias.met_servicio} onChange={handleChange}>Aprendizaje-Servicio</Checkbox>
                                    <Checkbox id="met_sda" name="metodologias" checked={formData.metodologias.met_sda} onChange={handleChange}>Situaciones de aprendizaje</Checkbox>
                                    <Checkbox id="met_descubrimiento" name="metodologias" checked={formData.metodologias.met_descubrimiento} onChange={handleChange}>Aprendizaje por descubrimiento</Checkbox>
                                    <Checkbox id="met_rincones" name="metodologias" checked={formData.metodologias.met_rincones} onChange={handleChange}>Trabajo por rincones (Infantil)</Checkbox>
                                    <Checkbox id="met_globalizado" name="metodologias" checked={formData.metodologias.met_globalizado} onChange={handleChange}>Enfoque globalizado</Checkbox>
                                    <Checkbox id="met_steam" name="metodologias" checked={formData.metodologias.met_steam} onChange={handleChange}>Metodología STEAM</Checkbox>
                                    <Checkbox id="met_design" name="metodologias" checked={formData.metodologias.met_design} onChange={handleChange}>Design Thinking</Checkbox>
                                    <Checkbox id="met_otras" name="metodologias" checked={formData.metodologias.met_otras} onChange={handleChange}>Otras (especificar)</Checkbox>
                                 </div>
                            </div>
                            <div className="flex-1">
                                <FormLabel htmlFor="agrupamientos">Agrupamientos:</FormLabel>
                                <div className={checkboxContainerStyles}>
                                    <Checkbox id="agr_individual" name="agrupamientos" checked={formData.agrupamientos.agr_individual} onChange={handleChange}>Individual</Checkbox>
                                    <Checkbox id="agr_parejas" name="agrupamientos" checked={formData.agrupamientos.agr_parejas} onChange={handleChange}>Parejas</Checkbox>
                                    <Checkbox id="agr_pequeno" name="agrupamientos" checked={formData.agrupamientos.agr_pequeno} onChange={handleChange}>Pequeño grupo (3-4)</Checkbox>
                                    <Checkbox id="agr_medio" name="agrupamientos" checked={formData.agrupamientos.agr_medio} onChange={handleChange}>Grupo medio (5-6)</Checkbox>
                                    <Checkbox id="agr_grande" name="agrupamientos" checked={formData.agrupamientos.agr_grande} onChange={handleChange}>Gran grupo/Clase</Checkbox>
                                    <Checkbox id="agr_heterogeneo" name="agrupamientos" checked={formData.agrupamientos.agr_heterogeneo} onChange={handleChange}>Grupos heterogéneos</Checkbox>
                                    <Checkbox id="agr_homogeneo" name="agrupamientos" checked={formData.agrupamientos.agr_homogeneo} onChange={handleChange}>Grupos homogéneos</Checkbox>
                                    <Checkbox id="agr_flexible" name="agrupamientos" checked={formData.agrupamientos.agr_flexible} onChange={handleChange}>Grupos flexibles</Checkbox>
                                </div>
                                <FormLabel htmlFor="num_sesiones">Número de sesiones:</FormLabel>
                                <select id="num_sesiones" name="num_sesiones" value={formData.num_sesiones} onChange={handleChange} className={commonInputStyles}>
                                    <option value="">Selecciona...</option>
                                    <option>1 sesión</option> <option>2-3 sesiones</option> <option>4-6 sesiones</option>
                                    <option>7-10 sesiones</option> <option>Más de 10 sesiones</option> <option>Trimestral</option>
                                    <option>Anual</option> <option>Flexible</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 pt-6 border-t border-gray-300 flex flex-col sm:flex-row flex-wrap gap-4">
                        <button type="button" onClick={handleGuardarREA} className="flex-1 text-lg bg-[#2D7BC2] text-white font-bold py-3.5 px-6 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-[#256396]">
                            Guardar Etiquetas REA
                        </button>
                        <button type="button" onClick={handleExportarCSV} className="flex-1 text-lg bg-[#6080A3] text-white font-bold py-3.5 px-6 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-[#4d6681]">
                            Exportar CSV
                        </button>
                        <button type="button" onClick={handleExportJSON} className="flex-1 text-lg bg-[#2DC2C2] text-white font-bold py-3.5 px-6 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-[#24a0a0]">
                            Exportar Metadatos (JSON)
                        </button>
                    </div>

                </form>

                <footer className="text-sm text-[#6080A3] mt-8 text-center">
                    Simulador de catalogación REA · ikasNOVA · Navarra
                </footer>
            </div>
        </main>
    );
};

export default App;
