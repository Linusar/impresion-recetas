/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import React, { useEffect, useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RecetaTable from '../components/RecetaTable';
import OptionsContextProvider from '../context/OptionsContext';
import { RecetasContext } from '../context/RecetasContext';
import { AlertContext } from '../context/AlertContext';
import { ModalContext } from '../context/ModalContext';
import { UserContext } from '../context/UserContext';
import generateMeppes from '../utils/meppes';
import generateMedicamentos from '../utils/medicamentos';
import AlertDialog from '../components/AlertDialog';
import ContentViewModal from '../components/ContentViewModal';
import RecetaForm from '../components/RecetaForm';
import LinearProgressCustom from '../components/LinearProgressCustom';
import BadgesCustom from '../components/BadgesCustom';
import PaperForm from '../components/PaperForm';

const HomePage = () => {
  const [view, setView] = useState(false);
  const [modify, setModify] = useState(false);
  const [receta, setReceta] = useState({});
  const [delivered, setDelivered] = useState(false);
  const [open, setOpen] = React.useState(false);
  const { user, getUSer } = useContext(UserContext);
  const { recetas, setRecetas, getRecetas, delReceta, modReceta } = useContext(
    RecetasContext
  );
  const { alert, setAlert } = useContext(AlertContext);
  const { modal, setModal } = useContext(ModalContext);

  useEffect(() => {
    getUSer();
    getRecetas(delivered);
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const clickPrintButton = async data => {
    let result = {};
    const { tramite, type } = data;
    handleOpen();
    if (type === 'MEPPES') {
      result = await generateMeppes(
        tramite.toString(),
        user,
        user.folder,
        user.puppeteerfolder
      );
      console.log(result);
    } else {
      result = await generateMedicamentos(
        tramite.toString(),
        user,
        user.folder,
        user.puppeteerfolder
      );
      console.log(result);
    }
    const { response, message, error } = result;
    if (response.estado !== 'Pendiente' && !error) {
      data.printed = true;
      data.atPrinted = new Date();
      data.initiated = response.incio || '';
      data.authorizations = response.autorizaciones || [];
      data.affiliated = response.afiliado || '';
      data.state = response.estado || '';
      result = await modReceta(data);
      getRecetas(delivered);
      setAlert({
        open: true,
        variant: error ? 'error' : 'success',
        message
      });
    } else {
      setAlert({
        open: true,
        variant: error ? 'error' : 'info',
        message: error ? message : 'Pendiente de autorización!'
      });
    }
    handleClose();
  };

  const clickDeletedButton = async data => {
    const { _id } = data;
    const { error, message } = await delReceta(_id);
    setAlert({
      open: true,
      variant: error ? 'error' : 'success',
      message
    });
  };

  const clickDeliveredButton = async data => {
    // eslint-disable-next-line no-param-reassign
    data.delivered = true;
    data.atDelivered = new Date();
    const filterList = recetas.filter(r => r._id !== data._id);
    setRecetas(filterList);
    const { error, message } = await modReceta(data);
    setAlert({
      open: true,
      variant: error ? 'error' : 'success',
      message
    });
  };

  const actionUpdateReceta = async recetaData => {
    const { error, message } = await modReceta(recetaData);
    if (!error) {
      const newListRecetas = recetas.map(rec => {
        if (rec._id === recetaData._id) {
          rec.year = recetaData.year;
          rec.dni = recetaData.dni;
          rec.name = recetaData.name;
          rec.lastname = recetaData.lastname;
          rec.observations = recetaData.observations;
          rec.type = recetaData.type;
          rec.state = recetaData.state;
          rec.entity = recetaData.entity;
        }
        return rec;
      });
      setRecetas(newListRecetas);
    } else {
      setAlert({
        open: true,
        variant: 'error',
        message
      });
    }
    setModal(false);
  };

  const handleAllMedicamentos = () => {
    recetas.map(r => {
      clickPrintButton(r);
      console.log(r);
      return r;
    });
    return true;
  };

  const clickModifyButton = async data => {
    setView(false);
    setModify(true);
    setModal(true);
    setReceta(data);
  };

  const clickViewButton = async data => {
    setView(true);
    setModify(false);
    setModal(true);
    setReceta(data);
  };

  return (
    <OptionsContextProvider>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAllMedicamentos}
      >
        Verificar Todas
      </Button>
      <BadgesCustom recetas={recetas.length} />
      {view ? (
        <AlertDialog title="Detalle">
          <ContentViewModal receta={receta} />
        </AlertDialog>
      ) : (
        ''
      )}
      {modify ? (
        <AlertDialog title="Modificar">
          <RecetaForm
            handleAction={actionUpdateReceta}
            receta={receta}
            inputsDisabled={{ numberDisabled: true }}
          />
        </AlertDialog>
      ) : (
        ''
      )}
      <Modal open={open} onClose={handleClose}>
        <div>
          <LinearProgressCustom />
          <PaperForm>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Importante!!
            </Typography>
            <Typography gutterBottom>
              1) No cerrar el programa hasta que finalice la verificación.
            </Typography>
            <Typography gutterBottom>
              2) Si la conexión a internet no es buena o se interrumpe el
              proceso de verificación puede suceder que no se terminen de bajar
              todas las provisiones.
            </Typography>
            <Typography gutterBottom>
              3) En caso que un trámite demore más de lo habitual se aconseja
              verificar manualmente.
            </Typography>
          </PaperForm>
        </div>
      </Modal>
      <FormControlLabel
        control={
          <Switch
            checked={delivered}
            onChange={() => {
              setDelivered(!delivered);
              getRecetas(!delivered);
            }}
            value="delivered"
            color="primary"
          />
        }
        label="Entregadas"
      />
      <RecetaTable
        rows={recetas}
        handleActionPrint={clickPrintButton}
        handleActionDelivered={clickDeliveredButton}
        handleActionDeleted={clickDeletedButton}
        handleActionView={clickViewButton}
        handleActionModify={clickModifyButton}
      />
    </OptionsContextProvider>
  );
};

export default HomePage;
