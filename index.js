const fs = require('fs')
const path = require('path')
const translate = require('google-translate-api')

async function processFile (input) {
    let data = input.split('\n')
    let msgid = false
    let msgstr = false
    let output = ''
    let i = 0

    let translation = []

    for (let i = 0; i < data.length; i++) {
        let line = data[i]
        console.log(i, 'processing...', line)
        let a = (msgid || line.slice(0, 5) == 'msgid')
        let b = line.slice(0, 6) != 'msgstr' 
        if (a && b) {
            msgid = true
            let t = line.slice(7, line.length - 1)
            if (t.length != 0) {
                let translated_line = await translate_line(t)
                translation.push(translated_line)
            }
        } else if (!b) {
            msgid = false
            if (translation.length == 0) {
                output += 'msgstr ""' + '\n'
            }
            for (let j = 0; j < translation.length; j++) {
                if (j == 0) {
                    output += 'msgstr "' + translation[j] + '"' + '\n'
                    continue
                }
                output += '"' + translation[j] + '"' + '\n'
                
            }
            translation = []
            continue
        }
        output += line + '\n'
    }

    fs.writeFile(
        path.join(__dirname, './es_co.po'),
        output,
        function (err) {
            if (err) return console.log(err)
            console.log("finished")
        }
    )
}

async function translate_line (line) {
    let t = await translate(line, { from: 'en', to: 'es' }).then(res => {
        return res.text
    }).catch(err => {
        console.error(err);
    })

    return t
}

let input_filename = 'ca.po'

const input = fs.readFileSync(
    path.join(__dirname, input_filename),
    { encoding: 'utf-8' }
)

processFile(input)
