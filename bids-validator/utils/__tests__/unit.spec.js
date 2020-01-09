import unit from '../unit'

const { prefixes, roots } = unit
const validRoot = roots[0]

describe('unit validator', () => {
  it('handles simple units', () => {
    roots.forEach(validRoot => {
      const goodOutput = unit.validate(validRoot)
      expect(goodOutput.isValid).toBe(true)
    })
    const badOutput = unit.validate('definitielynotavalidroot')
    expect(badOutput.isValid).toBe(false)
  })

  it('handles simple units with prefixes', () => {
    prefixes.forEach(validPrefix => {
      const goodOutput = unit.validate(validPrefix + validRoot)
      expect(goodOutput.isValid).toBe(true)
    })
    const badOutput = unit.validate('badprefix' + validRoot)
    expect(badOutput.isValid).toBe(false)
  })

  const validExponents = ['^2', '¹²³', ...unit.superscriptNumbers]
  it('handles simple units with exponents', () => {
    validExponents.forEach(exp => {
      const goodOutput = unit.validate(validRoot + exp)
      expect(goodOutput.isValid).toBe(true)
    })
    const invalidExponents = ['^^12', '142', '1', '0', '^.1', '^2.1']
    invalidExponents.forEach(exp => {
      const badOutput = unit.validate(validRoot + exp)
      expect(badOutput.isValid).toBe(false)
    })
    validExponents.slice(0, 3).forEach(exp => {
      const badOutput = unit.validate(exp)
      expect(badOutput.isValid).toBe(false)
    })
  })

  it('handles derived units', () => {
    const validUnits = ['T/m', 'N*m', 'm^2/s^2', 'mm/ms', 'kT³*nm²', 'm²/s²']
    validUnits.forEach(derivedUnit => {
      const goodOutput = unit.validate(derivedUnit)
      expect(goodOutput.isValid).toBe(true)
    })
    const invalidUnits = [
      `/${validRoot}`,
      `*${validRoot}`,
      `${validRoot}/`,
      `${validRoot}*`,
      `${validRoot}//${validRoot}`,
      `${validRoot}///${validRoot}`,
      `${validRoot}**${validRoot}`,
      `${validRoot}***${validRoot}`,
      `${roots.slice(0, 3).join('')}`,
      ...validExponents.slice(0, 3).map(exp => `${exp}${validRoot}`),
    ]
    invalidUnits.forEach(derivedUnit => {
      const badOutput = unit.validate(derivedUnit)
      expect(badOutput.isValid).toBe(false)
    })
  })
})