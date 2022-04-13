"Try to delete DIR dist ..."
if (Test-Path -Path dist) {
    Remove-Item dist -Recurse -Force -Confirm:$false
    "Dir dist deleted."
} else {
    "Dir dist doesn't exist."
}

if ($args.count -gt 0) {
    "Try to delete DIR node_modules ..."
    if (Test-Path -Path node_modules) {
        Remove-Item node_modules -Recurse -Force -Confirm:$false
        "Dir node_modules deleted."
    } else {
        "Dir node_modules doesn't exist."
    }
}

"Try to delete package-lock.json file..."
if (Test-Path -Path package-lock.json) {
    Remove-Item 'package-lock.json'  -Force -Confirm:$false
    "File package-lock.json deleted."
} else {
    "File package-lock.json doesn't exist."
}

if ($args.count -gt 0) {
    "Run npm i..."
    npm i
}

"Run tsc..."
tsc
