import logo1 from '../assets/logo-1-evidencia-potencial.png';
import logo2 from '../assets/logo-2-comite-cafeteros.png';
import logo3 from '../assets/logo-3-alcaldia-manizales.png';
import './Membrete.css';

// Franja de membrete: respaldo claro y neutro para los 3 logos de los
// aliados. Es su propia banda separada del resto de la hoja — nunca va
// incrustada sobre un campo de color, según el compromiso de marca de
// PRODUCT.md.
export default function Membrete() {
  return (
    <div className="membrete" role="img" aria-label="Colombia Evidencia Potencial en Educación, Comité de Cafeteros de Caldas, y Alcaldía de Manizales">
      <img className="membrete-logo membrete-logo--evidencia" src={logo1} alt="Colombia Evidencia Potencial en Educación" />
      <span className="membrete-separador" aria-hidden="true" />
      <img className="membrete-logo" src={logo2} alt="Comité de Cafeteros de Caldas" />
      <span className="membrete-separador" aria-hidden="true" />
      <img className="membrete-logo" src={logo3} alt="Alcaldía de Manizales" />
    </div>
  );
}
