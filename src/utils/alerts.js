import Swal from 'sweetalert2';

const ValenciAlert = Swal.mixin({
  customClass: {
    confirmButton: 'bg-stone-900 text-amber-500 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all ml-3 outline-none',
    cancelButton: 'bg-stone-100 text-stone-500 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-stone-200 transition-all outline-none',
    popup: 'rounded-[3rem] border border-stone-100 shadow-2xl p-8',
    title: 'font-black uppercase tracking-tighter text-stone-800 text-xl',
    htmlContainer: 'font-medium text-stone-500 text-sm'
  },
  buttonsStyling: false
});

export const notify = {
  success: (title, text) => ValenciAlert.fire({
    icon: 'success',
    iconColor: '#d97706',
    title,
    text,
    timer: 2500,
    showConfirmButton: false
  }),
  
  error: (title, text) => ValenciAlert.fire({
    icon: 'error',
    iconColor: '#78716c',
    title,
    text
  }),

  confirm: async (title, text, confirmButtonText = 'Confirmar') => {
    return ValenciAlert.fire({
      title,
      text,
      icon: 'warning',
      iconColor: '#d97706',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
  }
};