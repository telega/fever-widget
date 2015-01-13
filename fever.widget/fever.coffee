crypto = require 'crypto'

options =
    feverURL    : "fever.telega.org"
    feverUser   : "tom@telega.org"
    feverPass   : "bpr9Z4CgAMLWYn"
    feverAPIkey : () -> crypto.createHash("md5").update(@feverUser + ":" + @feverPass).digest("hex")


refreshFrequency: 600000            # Update every 10 minutes

style: """
  top  : 20px
  left : 80px
  width: 460px
  height: 700px
  color: #fff
  font-family: Helvetica Neue

  .temp
    border-bottom:1px solid #fff
    padding-top: 10px
    padding-bottom: 2px
    font-size:20px
    text-indent:22px
    background:-2px 12px no-repeat url(fever.widget/fever-sm.png)
  
  li
    margin: 0 0
    padding: 6px 0 2px 28px
    list-style-image:none
    list-style:none
    background:2px 0 repeat-y url(fever.widget/bg.png)
    min-height:16px
    font-size:14px

  ul
    margin: 1px 0 0 0

  a:link, visited
    text-decoration:none
    color:#fff


"""

command: "#{process.argv[0]} fever.widget/fever \
                              \"#{options.feverURL}\" \
                              \"#{options.feverAPIkey()}\""


render: (output) -> """
  <div class='links'></div>
"""

update: (output, domEl) ->

  data = JSON.parse(output)
  el = $(domEl).find('.links')
  el.html ''
  temp = 999
  for link in data.links
    if link.temperature < temp
      temp = link.temperature
      el.append @renderTemp(temp)
    el.append @renderLink(link)

renderLink: (link) ->
  
    """
    <li class='link'>
      <a href="#{link.url}">#{link.title}</a>
    </li>
    """

renderTemp: (temp) ->
  
    """
      </ul>
    <div class='temp'>#{temp}°</div>
      <ul>
    """
