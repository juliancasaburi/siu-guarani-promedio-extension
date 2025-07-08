# Extensión Promedio en Historia Académica de SIU Guaraní

Esta extensión te permite visualizar de manera sencilla el promedio de tus calificaciones en la Historia Académica de SIU Guaraní.

# 💻 Navegadores compatibles
Esta extensión es compatible con los siguientes navegadores:

## Chrome/Basados en Chromium
- `Google Chrome`
- `Brave`
- `Microsoft Edge`
- `Opera`
- Otros navegadores basados en Chromium

## Basados en Firefox

- [`Waterfox`](https://github.com/WaterfoxCo/Waterfox)
- [`Floorp`](https://github.com/Floorp-Projects/Floorp)
- Otros navegadores basados en Firefox que permiten la instalación de extensiones no verificadas

# 🛠️ Instalación

## Para Chrome/Basados en Chromium
1. Descargar `siu-guarani-promedio-chromium.zip` desde [Releases](https://github.com/juliancasaburi/siu-guarani-promedio-extension/releases) y **extraerla en una carpeta**.

2. En el navegador abre la página de **Extensiones**:
   - En Google Chrome, visita [chrome://extensions/](chrome://extensions/)
   - En Microsoft Edge, visita [edge://extensions/](edge://extensions/)
   - En Brave, visita [brave://extensions/](brave://extensions/)
   - En Opera, visita [opera://extensions/](opera://extensions/)

3. Habilita el **Modo de desarrollador**.

4. Selecciona **Cargar extensión sin empaquetar / Carga desempaquetada**.

   Aparecerá un cuadro de diálogo para que selecciones la carpeta de la extensión. Busca y selecciona **la carpeta extraída** que contiene los archivos de la extensión y luego haz clic en "Seleccionar carpeta".

La extensión aparecerá en la lista de extensiones instaladas y podrás gestionarla desde esta interfaz. A partir de ahora, la extensión estará funcionando en tu navegador.

![Chromium Extension](https://github.com/user-attachments/assets/c0bbb30a-90fc-4740-8bc5-138737d59335)

## Para derivados de Firefox
1. Descargar `siu-guarani-promedio-firefox.zip` desde [Releases](https://github.com/juliancasaburi/siu-guarani-promedio-extension/releases) (**no extraer**).

2. En el navegador, abre la página de **Complementos** visitando [about:addons](about:addons).

3. Haz clic en el ícono de engranaje y selecciona **Instalar complemento desde archivo...**.

4. Aparecerá un cuadro de diálogo para que selecciones el archivo de la extensión. Busca y selecciona **el archivo ZIP** `siu-guarani-promedio-firefox.zip` que descargaste (sin extraer) y haz clic en "Abrir".

5. Confirma la instalación cuando se te solicite.
  
7. La extensión aparecerá en la lista de complementos instalados y podrás gestionarla desde esta interfaz. A partir de ahora, la extensión estará funcionando en tu navegador.

![Firefox Extension](https://github.com/user-attachments/assets/db548583-a54b-4b50-a45a-71d1a9371fb2)

# 📖 Uso
1. Inicia sesión en `SIU Guaraní`.
2. Navega hasta la página de `Reportes -> Historia Académica -> Historia completa`
3. Podrás visualizar tus promedios (con y sin aplazos) antes del listado de asignaturas.

![image](https://github.com/juliancasaburi/siu-guarani-promedio-extension/assets/48498042/f0efdf67-e036-4be2-bd41-78a1da5d07db)

### Estudiantes de UNLP Informática
Adicionalmente, podrás ver tu progreso en la propuesta si sos estudiante de alguna de las carreras de la Facultad de Informática de la Universidad Nacional de La Plata.

![progressBar-gif](https://github.com/juliancasaburi/siu-guarani-promedio-extension/assets/48498042/d91074a6-f337-48ce-99c9-b568a76eac88)

# 📟 Cálculo de los promedios
El cálculo de los promedios se realiza basado en la siguiente documentación:
https://documentacion.siu.edu.ar/wiki/SIU-Guarani/Version3.21.0/Glosario_de_conceptos/Promedio

# 💡 Contribuciones
Este proyecto es de código abierto, y está abierto a contribuciones de la comunidad. Si deseas mejorar la extensión o informar problemas, por favor visita el [repositorio en github](https://github.com/juliancasaburi/siu-guarani-promedio-extension).

# ❗Notas
- Esta extensión no almacena ni comparte tus datos personales ni tu historial académico. Solo se utiliza para mostrar información en tiempo real mientras navegas en SIU Guaraní.

- Esta extensión se ofrece "tal cual" y no está afiliada ni respaldada por SIU Guaraní.

- Su funcionamiento puede estar sujeto a cambios en la página web de SIU Guaraní.

# 🔧 Desarrollo

## Requisitos
- Node.js 18+
- npm

## Configuración del entorno de desarrollo
```bash
# Clona el repositorio
git clone https://github.com/juliancasaburi/siu-guarani-promedio-extension.git
cd siu-guarani-promedio-extension

# Instala las dependencias
npm install

# Desarrollo - Construye las extensiones para ambos navegadores
npm run build

# O construye para un navegador específico
npm run build:chrome    # Solo Chrome/Chromium
npm run build:firefox   # Solo Firefox

# Empaqueta todo (limpia, construye y crea ZIPs)
npm run package

# O empaqueta solo un navegador específico
npm run package:chrome
npm run package:firefox

# Para releases - proceso completo con validación
npm run release
```
