let s:bin_directory = expand('<sfile>:p:h:h:h') . '/bin/'

let s:default_config = {
    \ 'timeout': 2,
    \ 'port': v:null,
    \ 'executable_client': s:bin_directory . 'wsxhub',
\ }
let s:config = deepcopy(s:default_config)

let s:validations = {
    \ 'timeout': {
        \ 'description': 'a positive number',
        \ 'func': {x -> type(x) ==? v:t_number && x > 0},
    \ },
    \ 'port': {
        \ 'description': 'a positive number',
        \ 'func': {x -> type(x) ==? v:t_number && x > 0},
    \ },
    \ 'executable_client': {
        \ 'description': 'an executable string',
        \ 'func': {x -> type(x) ==? v:t_string && executable(x)},
    \ },
\ }

function! ctrlb#config#set(key, value) abort
    if !has_key(s:config, a:key)
        throw a:key . ' does not exist in config options.'
    endif

    let validation = s:validations[a:key]
    if !validation['func'](a:value)
        throw a:key . ' must be ' . validation['description'] . '.'
    endif

    let s:config[a:key] = a:value
endfunction

function! ctrlb#config#get(key) abort
    if !has_key(s:config, a:key)
        throw a:key . ' does not exist in config options.'
    endif
    return s:config[a:key]
endfunction

function! ctrlb#config#clear() abort
    let s:config = deepcopy(s:default_config)
endfunction
