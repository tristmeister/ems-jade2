import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ThermometerSun,
  Info,
  FlaskConical,
  Filter,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Droplet,
  Home,
  BarChart2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "tailwindcss/tailwind.css";
import AdvancedGraphs from "./components/AdvancedGraphs";


// Sample data for visualizations
// Utility function for data interpolation
const interpolateValue = (prev, next) => {
  if (prev === null || next === null) return null;
  return (prev + next) / 2;
};

const interpolateData = (data) => {
  return data.map((item, index) => {
    if (index === 0 || index === data.length - 1) return item;

    const interpolated = {};
    const prev = data[index - 1];
    const next = data[index + 1];

    Object.keys(item).forEach((key) => {
      if (key === "date" || key === "notes" || key === "prevDayTemp") {
        interpolated[key] = item[key];
      } else if (item[key] === null) {
        interpolated[key] = interpolateValue(prev[key], next[key]);
        interpolated[`${key}_interpolated`] = true;
      } else {
        interpolated[key] = item[key];
        interpolated[`${key}_interpolated`] = false;
      }
    });

    return interpolated;
  });
};

const sampleData = [
  {
    date: "2024-08-27",
    temperature: 17,
    prevDayTemp: 16,
    nitrat: null,
    nitrit: 0.05,
    phosphat: null,
    ph: 6.5,
    sauerstoff: 13,
    carbonhearte: null,
    ammonium: null,
    notes: "Enten :)",
  },
  {
    date: "2024-09-10",
    temperature: 14,
    prevDayTemp: 20,
    nitrat: 0.6,
    nitrit: 0.09,
    phosphat: 0.2,
    ph: 7.0,
    sauerstoff: null,
    carbonhearte: 2.2,
    ammonium: 0.2,
    notes: "Viel Müll, Schliere,leichters Unwetter am Vortag, Abfall, Treibgut",
  },
  {
    date: "2024-10-22",
    temperature: 10,
    prevDayTemp: 11,
    nitrat: 0.42,
    nitrit: 0.05,
    phosphat: 0.13,
    ph: 7.5,
    sauerstoff: null,
    carbonhearte: 3.5,
    ammonium: 0.364,
    notes: "Bewölkt sonst ruhig",
  },
  {
    date: "2024-11-05",
    temperature: 8,
    prevDayTemp: 9,
    nitrat: null,
    nitrit: 0.03,
    phosphat: null,
    ph: 6.5,
    sauerstoff: 5.02,
    carbonhearte: 1.1,
    ammonium: 0.4,
    notes: "2 Enten, ein Opa beim Ruderverein der skeptisch war",
  },
  {
    date: "2024-11-19",
    temperature: 11,
    prevDayTemp: 8,
    nitrat: 1.9,
    nitrit: 0.02,
    phosphat: 0.9,
    ph: 7.5,
    sauerstoff: 6.43,
    carbonhearte: 1.3,
    ammonium: 0.5,
    notes: "",
  },
  {
    date: "2024-12-03",
    temperature: 6,
    prevDayTemp: 7,
    nitrat: 1.0,
    nitrit: 0.04,
    phosphat: 0.8,
    ph: 7.0,
    sauerstoff: null,
    carbonhearte: 1.0,
    ammonium: 0.6,
    notes: "Leicht Bewölkt, Kein Müll, aber etwas Blätter",
  },
  {
    date: "2024-12-17",
    temperature: 5,
    prevDayTemp: 4,
    nitrat: 1.8,
    nitrit: 0.12,
    phosphat: 0.3,
    ph: 7.25,
    sauerstoff: 6.53,
    carbonhearte: 6.0,
    ammonium: 0.5,
    notes: "",
  },
  {
    date: "2025-01-14",
    temperature: 6,
    prevDayTemp: 5,
    nitrat: 0.5,
    nitrit: 0.03,
    phosphat: 0.9,
    ph: 7.0,
    sauerstoff: 8.24,
    carbonhearte: 1.3,
    ammonium: 0.5,
    notes: "",
  },
  {
    date: "2025-01-28",
    temperature: 6,
    prevDayTemp: 8,
    nitrat: 0.5,
    nitrit: 0.03,
    phosphat: 0.2,
    ph: 7.0,
    sauerstoff: 7.7,
    carbonhearte: 0.9,
    ammonium: 0.5,
    notes: "Sehr Klarer Himmel",
  },
];

// Parameter Information
const parameterInfo = {
  nitrat: {
    label: "Nitrate",
    unit: "mg/L",
    alert: 50,
    warning: 30,
    icon: FlaskConical,
    color: "text-red-600",
  },
  nitrit: {
    label: "Nitrite",
    unit: "mg/L",
    alert: 1,
    warning: 0.5,
    icon: FlaskConical,
    color: "text-yellow-600",
  },
  phosphat: {
    label: "Phosphate",
    unit: "mg/L",
    alert: 2,
    warning: 1,
    icon: FlaskConical,
    color: "text-blue-600",
  },
  ph: {
    label: "pH Value",
    unit: "",
    alert: 8.5,
    warning: 8,
    icon: Droplet,
    color: "text-green-600",
  },
  sauerstoff: {
    label: "Oxygen Content",
    unit: "mg/L",
    alert: 6,
    warning: 7,
    icon: Droplet,
    color: "text-teal-600",
  },
  carbonhearte: {
    label: "Carbonate Hardness",
    unit: "°dH",
    alert: 15,
    warning: 12,
    icon: FlaskConical,
    color: "text-purple-600",
  },
  ammonium: {
    label: "Ammonium",
    unit: "mg/L",
    alert: 1,
    warning: 0.5,
    icon: FlaskConical,
    color: "text-orange-600",
  },
};

// Overview Component
const Overview = ({ loading }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#001233]">Übersicht</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <Skeleton height={200} count={2} />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-md rounded p-4"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#001233]">
                Messstandort
              </h2>
              <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
                <span className="text-gray-500">Kartenplatzhalter</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-md rounded p-4"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-[#001233]">
                <Info
                  className="w-5 h-5 mr-2 text-blue-500"
                  data-tip="Projektübersicht Informationen"
                />
                Projektübersicht
              </h2>
              <ReactTooltip />
              <div className="prose">
                <p className="text-gray-600 mb-4">
                  Das Ems-Jade-Kanal Wasserqualitäts-Monitoring-Projekt
                  überwacht wichtige Wasserqualitätsparameter das ganze Jahr
                  über. Diese Initiative hilft dabei, die ökologische Gesundheit
                  des Kanals zu verstehen und identifiziert potenzielle
                  Umweltprobleme.
                </p>
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Hauptziele:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-blue-700">
                    <li>Überwachung der Wasserqualitätsparameter</li>
                    <li>Verfolgung saisonaler Veränderungen</li>
                    <li>Identifizierung von Umweltauswirkungen</li>
                    <li>Unterstützung der ökologischen Erhaltung</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Object.entries(parameterInfo).map(([key, info], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center mb-2">
              {React.createElement(info.icon, {
                className: `${info.color} w-5 h-5 mr-2`,
                "data-tip": info.label,
              })}
              <h3 className="font-medium text-[#001233]">{info.label}</h3>
              <ReactTooltip />
            </div>
            <p className={`text-2xl font-bold ${info.color}`}>
              {sampleData[8][key]} {info.unit}
            </p>
            <p className="text-sm text-gray-500">Latest Reading</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Graphs Component
const Graphs = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#001233]">Diagramme</h1>
      <AdvancedGraphs data={sampleData} parameterInfo={parameterInfo} />
    </div>
  );
};

// Individual Readings Component
const IndividualReadings = ({ loading }) => {
  const [currentReading, setCurrentReading] = useState(0);
  const interpolatedData = interpolateData(sampleData);

  const renderValue = (key, value, isInterpolated) => {
    return (
      <div className="flex items-center">
        <span className={isInterpolated ? "opacity-70" : ""}>
          {value?.toFixed(2) || "N/A"}
        </span>
        {isInterpolated && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            Interpoliert
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#001233]">
        Einzelne Messwerte
      </h1>

      {loading ? (
        <Skeleton height={400} />
      ) : (
        <>
          {/* Reading Navigation */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
            <button
              onClick={() => setCurrentReading((prev) => Math.max(0, prev - 1))}
              className="p-2 rounded hover:bg-gray-100 transition-transform transform hover:scale-105"
              disabled={currentReading === 0}
            >
              <ChevronLeft
                className={
                  currentReading === 0 ? "text-gray-300" : "text-gray-600"
                }
              />
            </button>
            <div className="text-center">
              <h3 className="font-medium text-[#001233]">
                Messung {currentReading + 1} von {sampleData.length}
              </h3>
              <p className="text-sm text-gray-500">
                {sampleData[currentReading].date}
              </p>
            </div>
            <button
              onClick={() =>
                setCurrentReading((prev) =>
                  Math.min(sampleData.length - 1, prev + 1),
                )
              }
              className="p-2 rounded hover:bg-gray-100 transition-transform transform hover:scale-105"
              disabled={currentReading === sampleData.length - 1}
            >
              <ChevronRight
                className={
                  currentReading === sampleData.length - 1
                    ? "text-gray-300"
                    : "text-gray-600"
                }
              />
            </button>
          </div>

          {/* Reading Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow p-6 mt-6"
          >
            {/* Temperature Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#001233]">
                  Temperaturaufzeichnungen
                </h3>
                <ThermometerSun className="text-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-orange-700">Aktueller Tag</p>
                  <p className="text-xl font-bold text-orange-600">
                    {sampleData[currentReading].temperature}°C
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-700">Vorheriger Tag</p>
                  <p className="text-xl font-bold text-blue-600">
                    {sampleData[currentReading].prevDayTemp}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Measurements Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 text-[#001233]">
                Chemische Parameter
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(sampleData[currentReading])
                  .filter(([key]) => parameterInfo[key])
                  .map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border rounded p-3 flex items-center hover:shadow-lg transition-shadow duration-300"
                    >
                      {React.createElement(parameterInfo[key].icon, {
                        className: `${parameterInfo[key].color} w-5 h-5 mr-2`,
                        "data-tip": parameterInfo[key].label,
                      })}
                      <ReactTooltip />
                      <div>
                        <p className="text-sm text-gray-500">
                          {parameterInfo[key].label}
                        </p>
                        <p
                          className={`font-medium ${parameterInfo[key].color}`}
                        >
                          {renderValue(
                            key,
                            interpolatedData[currentReading][key],
                            interpolatedData[currentReading][
                              `${key}_interpolated`
                            ],
                          )}{" "}
                          {parameterInfo[key].unit}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-[#001233]">
                Notizen & Beobachtungen
              </h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 p-4 rounded"
              >
                <p className="text-gray-700">
                  {sampleData[currentReading].notes}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

// Main App Component with Updated Sidebar and Interactivity
const App = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#ebebeb] text-[#fbfbff]">
      {/* Sidebar Navigation */}
      <motion.div
        className="w-64 bg-[#001233] shadow-xl"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full py-4">
          <Link
            to="/"
            className={`flex items-center px-6 py-4 space-x-3 border-l-4 transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-[#002366] border-[#004080] text-white"
                : "border-transparent hover:bg-[#002366] hover:border-[#004080]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Übersicht</span>
          </Link>
          <Link
            to="/graphs"
            className={`flex items-center px-6 py-4 space-x-3 border-l-4 transition-all duration-200 ${
              location.pathname === "/graphs"
                ? "bg-[#002366] border-[#004080] text-white"
                : "border-transparent hover:bg-[#002366] hover:border-[#004080]"
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium">Diagramme</span>
          </Link>
          <Link
            to="/readings"
            className={`flex items-center px-6 py-4 space-x-3 border-l-4 transition-all duration-200 ${
              location.pathname === "/readings"
                ? "bg-[#002366] border-[#004080] text-white"
                : "border-transparent hover:bg-[#002366] hover:border-[#004080]"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Messwerte</span>
          </Link>
        </div>
      </motion.div>

      {/* Page Content with Smooth Transition */}
      <div className="flex-grow p-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              type: "tween",
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="w-full h-full"
          >
            <Routes>
              <Route exact path="/" element={<Overview loading={false} />} />
              <Route path="/graphs" element={<Graphs />} />
              <Route
                path="/readings"
                element={<IndividualReadings loading={false} />}
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Starting Animation Function
const StartAnimation = () => {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <App />
      </motion.div>
    </Router>
  );
};

// Export the App
export default StartAnimation;
