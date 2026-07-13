/**
 * Reports the EVM chain targeted by the MangaVerse smart-contract layer.
 *
 * @returns {string} The targeted chain identifier.
 */
export function getTargetChain(): string {
  // Report the chain the contracts are deployed to.
  return 'polygon-zkevm';
}
