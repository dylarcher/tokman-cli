// src/core/tokenConflictResolver.js

/**
 * Resolves conflicts among a list of tokens based on their names and a specified strategy.
 * @param {Array<InternalToken>} unprocessedTokens - Array of InternalToken objects from all sources.
 * @param {string} conflictStrategy - e.g., 'figmaWins', 'cssWins', 'throwError', 'sourceOrderWins' (last one processed).
 * @returns {Array<InternalToken>} Array of unique InternalToken objects after conflict resolution.
 * @throws {Error} If strategy is 'throwError' and a conflict occurs.
 */
function resolveTokenConflicts(unprocessedTokens, conflictStrategy = 'figmaWins') {
  console.log(`Resolving token conflicts with strategy: ${conflictStrategy}`);
  const finalTokensMap = new Map();

  unprocessedTokens.forEach(token => {
    const existingToken = finalTokensMap.get(token.name);
    if (existingToken) {
      // console.warn(`Conflict detected for token: "${token.name}" (Sources: Existing '${existingToken.metadata.source}', New '${token.metadata.source}')`);
      let resolved = false;
      if (conflictStrategy === 'throwError') {
        throw new Error(`Token name conflict for "${token.name}" between sources '${existingToken.metadata.source}' and '${token.metadata.source}'.`);
      } else if (conflictStrategy === 'sourceOrderWins') {
        finalTokensMap.set(token.name, token); // Last one processed wins
        resolved = true;
      } else if (conflictStrategy === 'figmaWins') {
        if (token.metadata.source === 'figma') {
          finalTokensMap.set(token.name, token);
          resolved = true;
        } else if (existingToken.metadata.source !== 'figma') {
          // If existing is not Figma, and new is not Figma either, new one wins (sourceOrder for non-Figma)
          finalTokensMap.set(token.name, token);
          resolved = true;
        }
      } else if (conflictStrategy === 'cssWins') {
        if (token.metadata.source === 'css') {
          finalTokensMap.set(token.name, token);
          resolved = true;
        } else if (existingToken.metadata.source !== 'css') {
          finalTokensMap.set(token.name, token);
          resolved = true;
        }
      }

      // if (resolved) console.log(`  Resolved: Kept token from source '${finalTokensMap.get(token.name).metadata.source}'.`);
      // else console.log(`  Resolved: Kept existing token from source '${existingToken.metadata.source}'.`);

    } else {
      finalTokensMap.set(token.name, token);
    }
  });
  const resolvedTokens = Array.from(finalTokensMap.values());
  console.log(`Total unique tokens after conflict resolution: ${resolvedTokens.length}`);
  return resolvedTokens;
}

module.exports = { resolveTokenConflicts };
