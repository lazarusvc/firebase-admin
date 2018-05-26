import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import { Formik } from 'formik';

import { uploadFile } from '../../helpers'

import Img from '../ui/Img'

import Label from '../ui/Label'
import DialogBodyContainer from '../ui/DialogBodyContainer'
import Transition from '../ui/SlideUp'

const updateOrCreateEntry = async (
  _values,
  setSubmitting,
  imagesUrls,
  submit,
) => {
  let values = { ..._values }

  Object.entries(values).map(([key, value]) => {
    Object.entries(imagesUrls).forEach(([_key, url]) => {
      if (key === _key) {
        values[key] = url
      }
    })
  })

  await submit(values)

  setSubmitting(false)
}

class Form extends Component {
  state = {
    imagesUrls: {}
  }

  render() {
    const {
      data,
      columns,
      submit,
      upload,
      firebaseRef,
      dialogFormat,
    } = this.props

    const initialValues = { ...data }

    if (dialogFormat === 'create') {
      columns.forEach(({ name, type }) => {
        if (type === 'id')
          return
  
        if (type === 'string')
          initialValues[name] = ''
  
        if (type === 'number')
          initialValues[name] = 0
  
        if (type === 'boolean')
          initialValues[name] = false
  
        if (type === 'image')
          initialValues[name] = ''
      })
    }

    return (
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => {
          const { imagesUrls } = this.state

          updateOrCreateEntry(
            values, 
            setSubmitting,
            imagesUrls,
            submit,
          )
        }}
        render={({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setSubmitting,
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              {Object.entries(values).map(([key, value]) => {
                const typeOfKey = columns.filter(({ name }) => {
                  return name === key
                })[0].type

                if (typeOfKey === 'string') {
                  return (
                    <div key={key}>
                      <TextField
                        label={key}
                        value={value}
                        onChange={event => {
                          const { value } = event.target
                          setFieldValue(key, value)
                        }}
                        margin="normal" />
                    </div>
                  )
                }

                if (typeOfKey === 'image') {
                  return (
                    <div key={key}>
                      <Label>{key}</Label>
                      <div>
                        <Img src={this.state.imagesUrls[key] || value} />
                      </div>
                      <div>
                        <Button
                          variant="raised"
                          containerElement='label'
                          label='My Label'>
                          <input type="file"
                            name={key}
                            onChange={async event => {
                              setSubmitting(true)

                              const url = await uploadFile(event, firebaseRef)
    
                              let imagesUrls = { ...this.state.imagesUrls }
                              imagesUrls[key] = url
    
                              this.setState({ imagesUrls })

                              setSubmitting(false)
                            }} />
                        </Button>
                      </div>
                    </div>
                  )
                }

                if (typeOfKey === 'number') {
                  return (
                    <div key={key}>
                      <TextField
                        label={key}
                        value={value}
                        onChange={event => {
                          const { value } = event.target
                          setFieldValue(key, value)
                        }}
                        type="number"
                        margin="normal" />
                    </div>
                  )
                }

                if (typeOfKey === 'boolean') {
                  return (
                    <div key={key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(event, checked) => {
                              setFieldValue(key, checked);
                            }}
                            color="primary"
                            value="checkedB"
                          />
                        }
                        label={key}
                      />
                    </div>
                  )
                }
              })}
              <Button
                variant="raised"
                type="submit"
                disabled={isSubmitting}
                color="primary">
                Save
              </Button>
            </form>
          )
        }}
      />
    )
  }
}

export default class DialogComponent extends Component {
  render() {
    const {
      isOpen,
      onClose,
      changingData,
      columns,
      update,
      create,
      uploadFile,
      firebaseRef,
      dialogFormat
    } = this.props

    const submit = (
      dialogFormat === 'create'
        ? create
        : update
    )

    return (
      <Dialog
        fullScreen
        open={isOpen}
        onClose={this.onClose}
        TransitionComponent={Transition}
      >
        <AppBar>
          <Toolbar>
            <IconButton color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
            <div>{dialogFormat}</div>
          </Toolbar>
        </AppBar>
        <DialogBodyContainer>
          <Form
            data={changingData}
            columns={columns}
            submit={submit}
            upload={uploadFile}
            firebaseRef={firebaseRef}
            dialogFormat={dialogFormat} />
        </DialogBodyContainer>
      </Dialog>
    )
  }
}