export const WizardFornecedor = {
  steps: [
    {
      label: 'Cadastro',
      icon: 'fa fa-user',
      class: 'active',
    },
    {
      label: 'Dados Bancários',
      icon: 'fa fa-credit-card',
      class: '',
    },
    {
      label: 'Tarifas',
      icon: 'fa fa-percent',
      class: '',
    },
  ],
};

export const FornecedorNumeroSteps = {
  dadosCadastrais: 0,
  domicilioBancario: 1,
  tarifas: 2,
};
