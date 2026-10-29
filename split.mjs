// Découpe un texte en morceaux <= limit caractères pour Discord (limite 2000).
// Coupe de préférence aux sauts de ligne, et referme/rouvre les blocs de code
// ``` quand une coupure tombe au milieu, pour que la coloration reste correcte.
export function splitMessage(text, limit = 1900) {
  const chunks = [];
  const pieceLimit = limit - 100; // marge pour les ``` ajoutés autour
  const isBlank = (s) => !s.replace(/```\S*/g, '').trim();
  let current = '';
  let openFence = null; // ex: "```js" si on est dans un bloc de code

  const push = (body) => {
    if (!isBlank(body)) chunks.push(body);
  };

  for (const line of String(text).split('\n')) {
    const isFence = line.trim().startsWith('```');

    // Fermeture d'un bloc qui ne tient plus dans le morceau courant : on
    // referme ici plutôt que d'ouvrir un bloc vide dans le morceau suivant.
    if (isFence && openFence && current.length + 8 > limit) {
      push(current + '\n```');
      current = '';
      openFence = null;
      continue;
    }

    // Une ligne trop longue est coupée en dur (de préférence sur un espace).
    const pieces = [];
    let rest = line;
    while (rest.length > pieceLimit) {
      let cut = rest.lastIndexOf(' ', pieceLimit);
      if (cut < pieceLimit / 2) cut = pieceLimit;
      pieces.push(rest.slice(0, cut));
      rest = rest.slice(cut).replace(/^ /, '');
    }
    pieces.push(rest);

    for (const piece of pieces) {
      const candidate = current ? current + '\n' + piece : piece;
      const closing = openFence ? 4 : 0; // "\n```"
      if (candidate.length + closing > limit && current) {
        push(openFence ? current + '\n```' : current);
        current = openFence ? openFence + '\n' + piece : piece;
      } else {
        current = candidate;
      }
    }

    if (isFence) openFence = openFence ? null : line.trim();
  }

  push(openFence ? current + '\n```' : current);
  return chunks.length ? chunks : ['*(réponse vide)*'];
}
