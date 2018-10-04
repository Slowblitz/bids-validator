var utils = require('../utils')
var Issue = utils.issues.Issue

/**
 * session
 *
 * Takes a list of files and creates a set of file names that occur in subject
 * directories. Then generates a warning if a given subject is missing any
 * files from the set.
 */
const session = function missingSessionFiles(fileList) {
  const subjects = {}
  const issues = []
  for (let key in fileList) {
    if (fileList.hasOwnProperty(key)) {
      const file = fileList[key]
      let filename

      if (!file || (typeof window != 'undefined' && !file.webkitRelativePath)) {
        continue
      }

      const path = file.relativePath
      if (!utils.type.isBIDS(path) || utils.type.file.isStimuliData(path)) {
        continue
      }
      let subject
      //match the subject identifier up to the '/' in the full path to a file.
      const match = path.match(/sub-(.*?)(?=\/)/)
      if (match === null) {
        continue
      } else {
        subject = match[0]
      }

      // suppress inconsistent subject warnings for sub-emptyroom scans
      // in MEG data
      if (subject == 'sub-emptyroom') {
        continue
      }

      // initialize an empty array if we haven't seen this subject before
      if (typeof subjects[subject] === 'undefined') {
        subjects[subject] = []
      }
      // files are prepended with subject name, the following two commands
      // remove the subject from the file name to allow filenames to be more
      // easily compared
      filename = path.substring(path.match(subject).index + subject.length)
      filename = filename.replace(subject, '<sub>')
      subjects[subject].push(filename)
    }
  }

  const subject_files = []

  for (let subjKey in subjects) {
    if (subjects.hasOwnProperty(subjKey)) {
      const subject = subjects[subjKey]
      for (var i = 0; i < subject.length; i++) {
        const file = subject[i]
        if (subject_files.indexOf(file) < 0) {
          subject_files.push(file)
        }
      }
    }
  }

  var subjectKeys = Object.keys(subjects).sort()
  for (var j = 0; j < subjectKeys.length; j++) {
    const subject = subjectKeys[j]
    for (var set_file = 0; set_file < subject_files.length; set_file++) {
      if (subjects[subject].indexOf(subject_files[set_file]) === -1) {
        var fileThatsMissing =
          '/' + subject + subject_files[set_file].replace('<sub>', subject)
        issues.push(
          new Issue({
            file: {
              relativePath: fileThatsMissing,
              webkitRelativePath: fileThatsMissing,
              name: fileThatsMissing.substr(
                fileThatsMissing.lastIndexOf('/') + 1,
              ),
              path: fileThatsMissing,
            },
            reason:
              'This file is missing for subject ' +
              subject +
              ', but is present for at least one other subject.',
            code: 38,
          }),
        )
      }
    }
  }
  return issues
}

module.exports = session
