# Command-line interface feature module
#
# This feature add-on module enables dynamic command-line interface
# generation based on available runtime `app` instance.
#
# It utilizes the [commander](http://github.com/tj/commander.js) utility
# to dynamically construct the command line processing engine and
# invokes upon generation to process the passed in command line
# arguments.

module.exports =
  run: (app) ->
    program = require 'commander'
    colors  = require 'colors'

    # 1. Setup some default execution context
    version = (app.meta 'version')
    program
      .version version
      .description (app.meta 'description')
      .option '-I, --include [module]', 'pre-load the specified module(s) into runtime', ((x,y) -> y.concat x), []
      .option '--no-color', 'disable color output'

    # 2. extract -I include options
    program.parseOptions program.normalize process.argv.slice 2
    for preload in program.include
      source = app.load "!yaml #{preload}", async: false
      for name, model of source.properties
        console.info "absorbing a new model '#{name}' into running forge"
        app.attach name, model

    # for action, rpc of model.methods
    #   continue unless (model.meta "rpc.#{action}.if-feature") is 'cli'
    #   meta = model.meta "rpc.#{action}"

    #   status = meta.status
    #   command = "#{action}"

    model = app.access 'yangforge'
    for action, rpc of (model.meta 'rpc')
      continue unless rpc['if-feature'] is 'cli'

      status = rpc.status
      command = "#{action}"
      if rpc.input?['leaf-list']?.arguments?
        args = rpc.input['leaf-list'].arguments
        if args?.config is true
          argstring = args.units ? args.type
          argstring += '...' unless args['max-elements'] is 1
          command +=
            if args.mandatory then " <#{argstring}>"
            else " [#{argstring}]"

      cmd = program.command command
      cmd.description switch status
        when 'planned' then "#{rpc.description} (#{status.cyan})"
        when 'deprecated' then "#{rpc.description} (#{status.yellow})"
        when 'obsolete' then "#{rpc.description} (#{status.red})"
        else rpc.description

      if rpc.input?.container?.options?
        for k, v of rpc.input.container.options when typeof v is 'object'
          for key, option of v
            optstring = "--#{key}"
            if option.units?
              optstring = "-#{option.units}, #{optstring}"
            type = option.type
            if type instanceof Object
              for tname, params of type
                if tname is 'enumeration'
                  type = Object.keys(params.enum).join '|'
                else
                  type = tname
                break;
            optstring += switch type
              when 'boolean','empty' then ''
              else
                if option.mandatory then " <#{type}>"
                else " [#{type}]"
            optdesc = option.description
            if !!option.default
              optdesc += " (default: #{option.default})"

            defaultValue = switch type
              when 'boolean' then (option.default is 'true')
              else option.default
            if defaultValue? and !!defaultValue
              console.debug? "setting option #{key} with default: #{defaultValue}"
              cmd.option optstring, optdesc, defaultValue
            else
              console.debug? "setting option #{key}: #{optdesc}"
              cmd.option optstring, optdesc

      do (cmd, action, status) ->
        cmd.action ->
          switch status
            when 'obsolete', 'planned'
              console.error "requested command is #{status} and cannot be used at this time".yellow
              cmd.help()
            when 'deprecated'
              console.warn "requested command has been #{status} and should no longer be used".yellow

          try
            [ args..., opts ] = arguments
            model.invoke action, arguments: ([].concat args...), options: opts
              .then (res) ->
                console.debug? "action '#{action}' completed"
                console.info res.get()
              .catch (err) ->
                console.error err if err?.context
                console.error "#{err}".red
                cmd.help()
          catch e
            console.error "#{e}".red
            cmd.help()

    program.parse process.argv
    return program
