import Test from "@/pages/test";

// Componente App simplificado para descartar problemas
function App() {
  console.log("Renderizando App component");
  return (
    <div className="App">
      <h1>Sistema de Gestión Agropecuaria</h1>
      <Test />
    </div>
  );
}

export default App;