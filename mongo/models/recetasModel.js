import mongoose from 'mongoose';

const { Schema } = mongoose;

const recetaSchema = new Schema({
  tramite: {
    type: Number,
    index: true,
    unique: [true, 'Existe otro tramite con el mismo número'],
    required: true
  },
  region: {
    type: String,
    maxlength: 2,
    minlength: 2,
    index: true,
    required: [true, 'Region es requerida']
  },
  delegation: {
    type: String,
    maxlength: 3,
    minlength: 3,
    index: true,
    required: [true, 'Delegación es requerida']
  },
  number: {
    type: String,
    maxlength: 7,
    minlength: 1,
    index: true,
    required: [true, 'Numero es requerido']
  },
  year: {
    type: String,
    maxlength: 2,
    minlength: 2,
    index: true,
    required: true
  },
  dni: {
    type: String,
    maxlength: 8,
    minlength: 8,
    index: true,
    required: true
  },
  name: {
    type: String,
    maxlength: 150,
    minlength: 2,
    index: true,
    uppercase: true
  },
  lastname: {
    type: String,
    maxlength: 150,
    minlength: 2,
    index: true,
    uppercase: true
  },
  type: {
    type: String,
    uppercase: true,
    enum: ['MEPPES', 'CENTRALIZADO', 'EXEPCION']
  },
  state: {
    type: String,
    uppercase: true,
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
    default: 'PENDIENTE'
  },
  entity: {
    type: String,
    uppercase: true,
    default: 'PARTICULAR'
  },
  printed: {
    type: Boolean,
    default: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  time: { type: Date, default: Date.now, required: true }
});

export default mongoose.model('Receta', recetaSchema);