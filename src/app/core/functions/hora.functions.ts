// descrição regex https://regex101.com/r/UfgFE1/1
function regexValidaHora(): RegExp {
  return /^((?:[0-1]{1})[0-9]{1}|(?:[2]{1})[0-3]{1})[\:]{1}((?:[0-5]{1})[0-9]{1})$/;
}

export const HoraFunctions = {
  regexValidaHora,
};
