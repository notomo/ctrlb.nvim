
let s:suite = themis#suite('health')
let s:assert = themis#helper('assert')

function! s:suite.before()
    let s:root = CtrlbTestBefore()
endfunction

function! s:suite.after_each()
    call CtrlbTestAfterEach()
endfunction

let s:ok_message = 'The compiled files are up to date.'
function! s:suite.check()
    execute 'checkhealth ctrlb'

    let line = search(s:ok_message, 'n')
    call s:assert.not_equals(line, 0)

    let line = search('The client command exists.', 'n')
    call s:assert.not_equals(line, 0)

    let line = search('Failed to communicate with the server.', 'n')
    call s:assert.not_equals(line, 0)
endfunction

function! s:suite.valid_version()
    call health#ctrlb#_set_test_path(s:root . '/test/autoload/_test_data/valid_version')

    execute 'checkhealth ctrlb'

    let line = search(s:ok_message, 'n')
    call s:assert.not_equals(line, 0)
endfunction

function! s:suite.no_version_file()
    call health#ctrlb#_set_test_path(s:root . '/test/autoload/_test_data/no_lib')

    execute 'checkhealth ctrlb'

    let line = search('There are no compiled files.', 'n')
    call s:assert.not_equals(line, 0)
endfunction

function! s:suite.outdated_version()
    call health#ctrlb#_set_test_path(s:root . '/test/autoload/_test_data/outdated_version')

    execute 'checkhealth ctrlb'

    let line = search('The compiled files are outdated.', 'n')
    call s:assert.not_equals(line, 0)
endfunction

function! s:suite.invalid_client()
    call health#ctrlb#_set_test_client('invalid_client')

    execute 'checkhealth ctrlb'

    let line = search('The client command does not exist.', 'n')
    call s:assert.not_equals(line, 0)
endfunction

function! s:suite.server()
    call ctrlb#config#set('server_port', 8009)
    call ctrlb#config#set('port', 8010)

    call ctrlb#start_server()

    execute 'checkhealth ctrlb'

    let line = search('The server is running.', 'n')
    call s:assert.not_equals(line, 0)

    call ctrlb#stop_server()
endfunction
