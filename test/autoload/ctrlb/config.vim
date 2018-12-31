
let s:suite = themis#suite('config')
let s:assert = themis#helper('assert')

function! s:suite.before()
    let s:root = CtrlbTestBefore()
endfunction

function! s:suite.after_each()
    call CtrlbTestAfterEach()
endfunction

function! s:suite.config_set_and_get()
    let timeout = 1
    call ctrlb#config#set('timeout', timeout)

    call s:assert.equals(ctrlb#config#get('timeout'), timeout)

    let port = 8004
    call ctrlb#config#set('port', port)

    call s:assert.equals(ctrlb#config#get('port'), port)
endfunction

function! s:suite.clear()
    let default_timeout = ctrlb#config#get('timeout')
    call ctrlb#config#set('timeout', 10)

    call ctrlb#config#clear()

    call s:assert.equals(ctrlb#config#get('timeout'), default_timeout)
endfunction

function! s:suite.set_invalid_key()
    try
        call ctrlb#config#set('invalid_key', 1)
    catch /invalid_key does not exist in config options./
    endtry
endfunction

function! s:suite.set_invalid_value()
    try
        call ctrlb#config#set('timeout', 0)
    catch /timeout must be a positive number./
    endtry

    try
        call ctrlb#config#set('port', 0)
    catch /port must be a positive number./
    endtry
endfunction
