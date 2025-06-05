// src/parsers/figmaStylesParser.js
const { parseFigmaColor } = require('./figmaVariablesParser');

function parseFigmaStylesResponse(figmaStylesData, figmaNodesData = {}) {
  if (!Array.isArray(figmaStylesData)) {
    return [];
  }
  const potentialTokens = [];

  figmaStylesData.forEach(style => {
    const styleId = style.key || style.node_id;
    const originalNodeId = style.node_id;
    const baseName = style.name;
    const commonMetadata = { figmaStyleId: styleId, styleType: style.style_type, rawStyle: style, resolvedFromNodeId: originalNodeId, originalNodeData: figmaNodesData[originalNodeId]?.document?.style };

    if (style.style_type === 'FILL') {
      const node = figmaNodesData[originalNodeId];
      let colorValue = null;
      if (node && node.document && node.document.fills && Array.isArray(node.document.fills)) {
        const solidFill = node.document.fills.find(
          fill => fill.type === 'SOLID' && (fill.visible === undefined || fill.visible === true) && fill.color
        );
        if (solidFill) {
          colorValue = parseFigmaColor(solidFill.color);
        }
      }
      if (colorValue) {
        potentialTokens.push({
          name: baseName, value: colorValue, type: 'color', source: 'figma-style',
          description: style.description || '', needsNodeData: false, metadata: commonMetadata
        });
      } else {
        potentialTokens.push({
          name: baseName, needsNodeData: true, nodeId: originalNodeId, type: 'color', source: 'figma-style',
          description: style.description || '', metadata: { ...commonMetadata, resolvedFromNodeId: undefined, originalNodeData: undefined }
        });
      }
    } else if (style.style_type === 'TEXT') {
      const node = figmaNodesData[originalNodeId];
      if (node && node.document && node.document.style) {
        const textStyle = node.document.style;
        // Update commonMetadata to include actual node style data if resolved
        const currentCommonMetadata = { ...commonMetadata, originalNodeData: textStyle };

        if (textStyle.fontFamily) {
          potentialTokens.push({ name: `${baseName}-font-family`, value: textStyle.fontFamily, type: 'fontFamily', source: 'figma-style', description: style.description || `${baseName} Font Family`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (typeof textStyle.fontWeight === 'number') {
          potentialTokens.push({ name: `${baseName}-font-weight`, value: textStyle.fontWeight, type: 'fontWeight', source: 'figma-style', description: style.description || `${baseName} Font Weight`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (typeof textStyle.fontSize === 'number') {
          potentialTokens.push({ name: `${baseName}-font-size`, value: textStyle.fontSize, unit: 'px', type: 'dimension', source: 'figma-style', description: style.description || `${baseName} Font Size`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (textStyle.letterSpacing !== undefined && typeof textStyle.letterSpacing.value === 'number') {
             let lsValue = textStyle.letterSpacing.value;
             let lsUnit = textStyle.letterSpacing.unit === "PERCENT" ? "%" : "px";
             potentialTokens.push({ name: `${baseName}-letter-spacing`, value: `${lsValue}${lsUnit}`, type: 'dimension', source: 'figma-style', description: style.description || `${baseName} Letter Spacing`, needsNodeData: false, metadata: currentCommonMetadata });
        } else if (typeof textStyle.letterSpacing === 'number') {
             potentialTokens.push({ name: `${baseName}-letter-spacing`, value: textStyle.letterSpacing, unit: 'px', type: 'dimension', source: 'figma-style', description: style.description || `${baseName} Letter Spacing`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (textStyle.lineHeightPx !== undefined && typeof textStyle.lineHeightPx === 'number') {
          potentialTokens.push({ name: `${baseName}-line-height`, value: textStyle.lineHeightPx, unit: 'px', type: 'dimension', source: 'figma-style', description: style.description || `${baseName} Line Height`, needsNodeData: false, metadata: currentCommonMetadata });
        } else if (textStyle.lineHeightPercent !== undefined && typeof textStyle.lineHeightPercent === 'number') {
             if (textStyle.lineHeightUnit === 'PERCENT') {
                 potentialTokens.push({ name: `${baseName}-line-height`, value: `${textStyle.lineHeightPercent}%`, type: 'dimension', source: 'figma-style', description: style.description || `${baseName} Line Height`, needsNodeData: false, metadata: currentCommonMetadata });
             }
        }
        if (textStyle.textAlignHorizontal) {
             potentialTokens.push({ name: `${baseName}-text-align`, value: textStyle.textAlignHorizontal.toLowerCase(), type: 'string', source: 'figma-style', description: style.description || `${baseName} Text Align`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (textStyle.textCase) {
             potentialTokens.push({ name: `${baseName}-text-case`, value: textStyle.textCase.toLowerCase().replace('_','-'), type: 'string', source: 'figma-style', description: style.description || `${baseName} Text Case`, needsNodeData: false, metadata: currentCommonMetadata });
        }
        if (textStyle.textDecoration) {
             potentialTokens.push({ name: `${baseName}-text-decoration`, value: textStyle.textDecoration.toLowerCase().replace('_','-'), type: 'string', source: 'figma-style', description: style.description || `${baseName} Text Decoration`, needsNodeData: false, metadata: currentCommonMetadata });
        }
      } else {
        potentialTokens.push({ name: baseName, needsNodeData: true, nodeId: originalNodeId, type: 'typography', source: 'figma-style', description: style.description || '', metadata: { ...commonMetadata, resolvedFromNodeId: undefined, originalNodeData: undefined } });
      }
    } else if (style.style_type === 'EFFECT') {
      const node = figmaNodesData[originalNodeId];
      // Update commonMetadata to include actual node effect data if resolved
      const currentCommonMetadata = { ...commonMetadata, originalNodeData: node?.document?.effects };

      if (node && node.document && Array.isArray(node.document.effects) && node.document.effects.length > 0) {
        let effectTokensGenerated = 0;
        node.document.effects.forEach((effect, index) => {
          if (effect.visible === false) return;

          let effectToken = null;
          const effectBaseName = `${baseName}-${index}`;

          if ((effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && effect.color) {
            effectToken = {
              name: `${effectBaseName}-${effect.type.toLowerCase().replace('_', '-')}`,
              value: {
                type: effect.type,
                color: parseFigmaColor(effect.color),
                offsetX: effect.offset ? effect.offset.x : 0,
                offsetY: effect.offset ? effect.offset.y : 0,
                radius: effect.radius,
                spread: effect.spread || 0,
              },
              type: 'shadow',
              source: 'figma-style',
              description: style.description || `${baseName} ${effect.type} ${index}`,
              needsNodeData: false,
              metadata: { ...currentCommonMetadata, effectIndex: index, rawEffect: effect }
            };
          } else if (effect.type === 'LAYER_BLUR') {
            effectToken = {
              name: `${effectBaseName}-layer-blur`,
              value: effect.radius,
              unit: 'px',
              type: 'dimension',
              source: 'figma-style',
              description: style.description || `${baseName} Layer Blur ${index}`,
              needsNodeData: false,
              metadata: { ...currentCommonMetadata, effectIndex: index, rawEffect: effect }
            };
          }

          if (effectToken) {
            potentialTokens.push(effectToken);
            effectTokensGenerated++;
          }
        });

        if (effectTokensGenerated === 0) { // If all effects were invisible or of unsupported types
             potentialTokens.push({ name: baseName, needsNodeData: true, nodeId: originalNodeId, type: 'effect', source: 'figma-style', description: style.description || '', metadata: { ...commonMetadata, resolvedFromNodeId: undefined, originalNodeData: undefined } });
        }

      } else {
        potentialTokens.push({ name: baseName, needsNodeData: true, nodeId: originalNodeId, type: 'effect', source: 'figma-style', description: style.description || '', metadata: { ...commonMetadata, resolvedFromNodeId: undefined, originalNodeData: undefined } });
      }
    }
  });
  return potentialTokens;
}

module.exports = {
  parseFigmaStylesResponse,
};
