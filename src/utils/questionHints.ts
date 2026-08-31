import { Question } from '../types';

export function getQuestionHint(question: Question): string {
  // If the question has a custom authored hint, use it
  if (question.hint && question.hint.trim().length > 0) {
    return question.hint;
  }

  // Otherwise, construct a rich, domain-specific pedagogical hint based on the question structure
  switch (question.type) {
    case 'mental_math':
      if (question.operator === '×') {
        return `Pista: Descompón la multiplicación en partes más sencillas (por ejemplo, ${question.numA} × ${question.numB} = (${question.numA} × 5) + (${question.numA} × ${question.numB - 5})).`;
      }
      if (question.operator === '+') {
        if (question.numA < 0 || question.numB < 0) {
          return 'Pista: Al sumar números con signos opuestos, resta los valores absolutos y conserva el signo del número con mayor magnitud.';
        }
        return 'Pista: Reagrupa por decenas y unidades para facilitar el cálculo mental.';
      }
      if (question.operator === '-') {
        if (question.numA < 0 || question.numB < 0) {
          return 'Pista: Recuerda la regla de signos: restar un número negativo equivale a sumarlo (+).';
        }
        return 'Pista: Cuenta desde el sustraendo hasta el minuendo para hallar la diferencia rápidamente.';
      }
      if (question.operator === '÷') {
        return `Pista: Piensa qué número multiplicado por ${question.numB} da como resultado exactamente ${question.numA}.`;
      }
      if (question.operator === '^') {
        return `Pista: Elevar a la potencia significa multiplicar la base (${question.numA}) por sí misma ${question.numB} veces.`;
      }
      return 'Pista: Revisa con calma el cálculo aritmético antes de enviar tu respuesta.';

    case 'multiple_choice':
      const promptLower = question.prompt.toLowerCase();
      if (promptLower.includes('prioridad') || promptLower.includes('operaciones') || promptLower.includes('paréntesis')) {
        return 'Pista: Revisa primero qué operación tiene prioridad (Paréntesis → Potencias → Multiplicación/División → Suma/Resta).';
      }
      if (promptLower.includes('seno') || promptLower.includes('coseno') || promptLower.includes('tangente')) {
        return 'Pista: Recuerda las razones trigonométricas: Seno = Opuesto/Hipotenusa, Coseno = Adyacente/Hipotenusa, Tangente = Opuesto/Adyacente.';
      }
      if (promptLower.includes('pitágoras') || promptLower.includes('hipotenusa') || promptLower.includes('cateto')) {
        return 'Pista: Identifica cuál lado corresponde a la hipotenusa (el lado opuesto al ángulo recto de 90°).';
      }
      if (promptLower.includes('radian') || promptLower.includes('grado')) {
        return 'Pista: Recuerda que 180° equivale exactamente a π radianes (multiplica por π/180 para convertir).';
      }
      return 'Pista: Descarta las opciones que no coincidan con las propiedades fundamentales del problema.';

    case 'pythagoras_builder':
      if (question.targetSide === 'hipotenusa') {
        return 'Pista: La hipotenusa es el lado más largo. Aplica la fórmula: h = √(catetoA² + catetoB²).';
      } else {
        return 'Pista: Para calcular un cateto desconocido, resta el cuadrado del cateto conocido al cuadrado de la hipotenusa: c = √(h² - cateto_conocido²).';
      }

    case 'trig_ratio_builder':
      if (question.targetRatio === 'sin') {
        return 'Pista: Recuerda: el SENO relaciona el cateto opuesto con la hipotenusa (sen θ = Cateto Opuesto / Hipotenusa).';
      }
      if (question.targetRatio === 'cos') {
        return 'Pista: Recuerda: el COSENO relaciona el cateto adyacente con la hipotenusa (cos θ = Cateto Adyacente / Hipotenusa).';
      }
      if (question.targetRatio === 'tan') {
        return 'Pista: Recuerda: la TANGENTE relaciona el cateto opuesto con el cateto adyacente (tan θ = Cateto Opuesto / Cateto Adyacente).';
      }
      return 'Pista: Identifica los catetos opuesto y adyacente respecto al ángulo de referencia.';

    case 'unit_circle_point':
      return 'Pista: En la circunferencia unitaria: la coordenada X corresponde al Coseno (cos θ) y la coordenada Y corresponde al Seno (sen θ).';

    case 'order_steps':
      return 'Pista: Comienza por identificar la hipótesis o ecuación de partida, aplica las operaciones algebraicas en orden y finaliza con la conclusión buscada.';

    case 'trig_graph_manipulator':
      return 'Pista: La amplitud (A) define la altura máxima de la cresta desde el eje central, mientras que la frecuencia (B) determina el número de ciclos completos.';

    default:
      return 'Pista: Analiza detenidamente las variables y relaciones matemáticas planteadas en el enunciado.';
  }
}
