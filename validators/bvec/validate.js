const utils = require('../../utils')
const bvec = require('./bvec')

const validate = (files, bContentsDict) => {
  // validate bvec
  let issues = []
  const bvecPromises = files.map(function(file) {
    return new Promise((resolve, reject) => {
      utils.files
        .readFile(file)
        .then(contents => {
          bContentsDict[file.relativePath] = contents
          bvec(file, contents, function(bvecIssues) {
            issues = issues.concat(bvecIssues)
            resolve()
          })
        })
        .catch(err => {
          if (utils.issues.isAnIssue(err)) {
            issues.push(err)
            resolve()
          } else {
            reject(err)
          }
        })
    })
  })

  return new Promise((resolve, reject) =>
    Promise.all(bvecPromises)
      .then(() => resolve(issues))
      .catch(reject),
  )
}

module.exports = validate
